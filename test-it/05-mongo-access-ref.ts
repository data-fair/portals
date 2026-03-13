/**
 * Unit tests for mongoFilterAccessRef.
 *
 * This function builds a MongoDB filter intended for use in a $elemMatch on an
 * array of AccessRef. It answers the question: "among all AccessRefs on a document,
 * is there one that grants access to this session?"
 *
 * AccessRef structure in the database:
 *   { type: 'user', id?, email? }
 *   { type: 'organization', id, department: '-' | '*' | <deptId>, roles?: string[] }
 *
 *   department='-'      → only members at the root of the org (no department)
 *   department='*'      → all members of the org (root + all departments)
 *   department='sales'  → only members of the 'sales' department
 *
 * The session never has department='-': when a user is at the root,
 * account.department is simply absent (undefined).
 *
 * The produced filter always has this shape:
 *   { $or: [
 *       { type:'user', id: session.user.id },          ← always present
 *       { type:'user', email: session.user.email },    ← always present
 *       { type:'org', id, department:{$in:[...]},       ← only if account.type='organization'
 *         $or: [{roles:{$size:0}}, {roles:{$in:[role]}}] }
 *   ]}
 *
 * Department $in logic:
 *   session with no department  →  { $in: ['-', '*'] }     (root + global)
 *   session with dept='sales'   →  { $in: ['*', 'sales'] } (global + own dept)
 */
import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import { mongoFilterAccessRef } from '../api/src/utils/permissions.ts'

const createSession = (options: {
  userId: string
  userEmail: string
  accountType: 'user' | 'organization'
  accountId: string
  accountDepartment?: string
  accountRole?: string
}) => ({
  user: { id: options.userId, email: options.userEmail, name: 'Test User' },
  account: {
    type: options.accountType,
    id: options.accountId,
    name: 'Test Account',
    department: options.accountDepartment   // undefined = at root
  },
  accountRole: options.accountRole || 'admin'
} as any)

// ---------------------------------------------------------------------------
// Helpers to simulate $elemMatch behavior on an array of AccessRefs
// ---------------------------------------------------------------------------

const matchesUserRef = (filter: any, ref: { type: string; id?: string; email?: string }) =>
  filter.$or.some((cond: any) =>
    cond['access.type'] === ref.type &&
    (cond['access.id'] === ref.id || (ref.email !== undefined && cond['access.email'] === ref.email))
  )

const matchesOrgRef = (
  filter: any,
  ref: { type: string; id: string; department: string; roles?: string[] }
) => {
  const orgCond = filter.$or?.find(
    (c: any) => c['access.type'] === 'organization' && c['access.id'] === ref.id
  )
  if (!orgCond) return false

  if (!orgCond['access.department'].$in.includes(ref.department)) return false

  const refRoles = ref.roles ?? []
  return orgCond.$or.some((c: any) => {
    if (c['access.roles']?.$size === 0) return refRoles.length === 0
    if (c['access.roles']?.$in) return refRoles.some((r: string) => c['access.roles'].$in.includes(r))
    return false
  })
}

// ---------------------------------------------------------------------------

describe('mongoFilterAccessRef', () => {
  // =========================================================================
  // CASE 1 — Personal account (account.type = 'user')
  //
  // A personal account always has the admin role. The filter should contain
  // exactly the two user-level conditions and nothing else — no organization entry.
  // =========================================================================
  it('Case 1 — personal account: filter contains only user-level conditions', () => {
    const session = createSession({
      userId: 'user-alice',
      userEmail: 'alice@example.com',
      accountType: 'user',
      accountId: 'user-alice',
      accountRole: 'admin',
    })

    const filter = mongoFilterAccessRef(session)

    // Verify the complete filter shape — no org condition should be present
    assert.deepEqual(filter, {
      $or: [
        { 'access.type': 'user', 'access.id': 'user-alice' },
        { 'access.type': 'user', 'access.email': 'alice@example.com' },
      ]
    })

    // --- should match ---
    assert.ok(
      matchesUserRef(filter, { type: 'user', id: 'user-alice' }),
      'should match AccessRef { type:user, id:"user-alice" }'
    )
    assert.ok(
      matchesUserRef(filter, { type: 'user', email: 'alice@example.com' }),
      'should match AccessRef { type:user, email:"alice@example.com" }'
    )

    // --- should not match ---
    assert.ok(
      !matchesUserRef(filter, { type: 'user', id: 'user-bob' }),
      'should not match AccessRef { type:user, id:"user-bob" }: wrong user'
    )
    assert.ok(
      !matchesOrgRef(filter, { type: 'organization', id: 'org-xyz', department: '-', roles: [] }),
      'should not match AccessRef { type:org, department:"-" }: personal account ignores org AccessRefs'
    )
    assert.ok(
      !matchesOrgRef(filter, { type: 'organization', id: 'org-xyz', department: '*', roles: [] }),
      'should not match AccessRef { type:org, department:"*" }: personal account ignores org AccessRefs'
    )
  })

  // =========================================================================
  // CASE 2 — Organization account, at root (account.department is undefined)
  //
  // A root member can see AccessRefs with department='-' (root only) and
  // department='*' (global), but not those scoped to a specific department.
  // =========================================================================
  it('Case 2 — org account at root: department filter is { $in: ["-", "*"] }', () => {
    const session = createSession({
      userId: 'user-bob',
      userEmail: 'bob@acme.com',
      accountType: 'organization',
      accountId: 'org-acme',
      accountRole: 'admin',
    })

    const filter = mongoFilterAccessRef(session)

    assert.equal(filter.$or.length, 3, 'should have 3 conditions: user id, user email, org')
    assert.deepEqual(filter.$or[0], { 'access.type': 'user', 'access.id': 'user-bob' })
    assert.deepEqual(filter.$or[1], { 'access.type': 'user', 'access.email': 'bob@acme.com' })

    const orgCond = filter.$or[2]
    assert.equal(orgCond['access.type'], 'organization')
    assert.equal(orgCond['access.id'], 'org-acme')
    assert.deepEqual(
      orgCond['access.department'],
      { $in: ['-', '*'] },
      'should filter department with { $in: ["-", "*"] } when session has no department'
    )
    assert.deepEqual(orgCond.$or[0], { 'access.roles': { $size: 0 } })
    assert.deepEqual(orgCond.$or[1], { 'access.roles': { $in: ['admin'] } })

    // --- should match ---
    assert.ok(
      matchesUserRef(filter, { type: 'user', id: 'user-bob' }),
      'should match AccessRef { type:user, id:"user-bob" }: user-level access is always honoured'
    )
    assert.ok(
      matchesUserRef(filter, { type: 'user', email: 'bob@acme.com' }),
      'should match AccessRef { type:user, email:"bob@acme.com" }: user-level access is always honoured'
    )
    assert.ok(
      matchesOrgRef(filter, { type: 'organization', id: 'org-acme', department: '-', roles: [] }),
      'should match AccessRef { department:"-", roles:[] }: root access, any role'
    )
    assert.ok(
      matchesOrgRef(filter, { type: 'organization', id: 'org-acme', department: '-', roles: ['admin'] }),
      'should match AccessRef { department:"-", roles:["admin"] }: root access, role matches'
    )
    assert.ok(
      matchesOrgRef(filter, { type: 'organization', id: 'org-acme', department: '*', roles: [] }),
      'should match AccessRef { department:"*", roles:[] }: global access covers root members'
    )
    assert.ok(
      matchesOrgRef(filter, { type: 'organization', id: 'org-acme', department: '*', roles: ['admin'] }),
      'should match AccessRef { department:"*", roles:["admin"] }: global access, role matches'
    )

    // --- should not match ---
    assert.ok(
      !matchesOrgRef(filter, { type: 'organization', id: 'org-acme', department: 'sales', roles: [] }),
      'should not match AccessRef { department:"sales" }: bob is at root, not in sales'
    )
    assert.ok(
      !matchesOrgRef(filter, { type: 'organization', id: 'org-acme', department: 'tech', roles: [] }),
      'should not match AccessRef { department:"tech" }: bob is at root, not in tech'
    )
    assert.ok(
      !matchesOrgRef(filter, { type: 'organization', id: 'org-acme', department: '-', roles: ['contrib'] }),
      'should not match AccessRef { department:"-", roles:["contrib"] }: bob is admin, not contrib'
    )
    assert.ok(
      !matchesOrgRef(filter, { type: 'organization', id: 'org-other', department: '-', roles: [] }),
      'should not match AccessRef { id:"org-other" }: wrong organization'
    )
  })

  // =========================================================================
  // CASE 3 — Organization account, in a department
  //
  // A department member can see AccessRefs with department='*' (global) and
  // those scoped to their own department, but not root-only ('-') or other deps.
  // =========================================================================
  it('Case 3 — org account in a department: department filter is { $in: ["*", "sales"] }', () => {
    const session = createSession({
      userId: 'user-carol',
      userEmail: 'carol@acme.com',
      accountType: 'organization',
      accountId: 'org-acme',
      accountDepartment: 'sales',
      accountRole: 'contrib',
    })

    const filter = mongoFilterAccessRef(session)

    assert.equal(filter.$or.length, 3)

    const orgCond = filter.$or[2]
    assert.deepEqual(
      orgCond['access.department'],
      { $in: ['*', 'sales'] },
      'should filter department with { $in: ["*", "sales"] } when session department is "sales"'
    )
    assert.deepEqual(orgCond.$or[1], { 'access.roles': { $in: ['contrib'] } })

    // --- should match ---
    assert.ok(
      matchesUserRef(filter, { type: 'user', id: 'user-carol' }),
      'should match AccessRef { type:user, id:"user-carol" }: user-level access is always honoured'
    )
    assert.ok(
      matchesUserRef(filter, { type: 'user', email: 'carol@acme.com' }),
      'should match AccessRef { type:user, email:"carol@acme.com" }: user-level access is always honoured'
    )
    assert.ok(
      matchesOrgRef(filter, { type: 'organization', id: 'org-acme', department: '*', roles: [] }),
      'should match AccessRef { department:"*", roles:[] }: global access covers all department members'
    )
    assert.ok(
      matchesOrgRef(filter, { type: 'organization', id: 'org-acme', department: '*', roles: ['contrib'] }),
      'should match AccessRef { department:"*", roles:["contrib"] }: global access, role matches'
    )
    assert.ok(
      matchesOrgRef(filter, { type: 'organization', id: 'org-acme', department: 'sales', roles: [] }),
      'should match AccessRef { department:"sales", roles:[] }: dept access, any role'
    )
    assert.ok(
      matchesOrgRef(filter, { type: 'organization', id: 'org-acme', department: 'sales', roles: ['contrib'] }),
      'should match AccessRef { department:"sales", roles:["contrib"] }: dept access, role matches'
    )

    // --- should not match ---
    assert.ok(
      !matchesOrgRef(filter, { type: 'organization', id: 'org-acme', department: '-', roles: [] }),
      'should not match AccessRef { department:"-" }: carol is in sales, not at root'
    )
    assert.ok(
      !matchesOrgRef(filter, { type: 'organization', id: 'org-acme', department: 'tech', roles: [] }),
      'should not match AccessRef { department:"tech" }: carol is in sales, not tech'
    )
    assert.ok(
      !matchesOrgRef(filter, { type: 'organization', id: 'org-acme', department: 'sales', roles: ['admin'] }),
      'should not match AccessRef { department:"sales", roles:["admin"] }: carol is contrib, not admin'
    )
    assert.ok(
      !matchesOrgRef(filter, { type: 'organization', id: 'org-other', department: '*', roles: [] }),
      'should not match AccessRef { id:"org-other" }: wrong organization'
    )
  })
})
