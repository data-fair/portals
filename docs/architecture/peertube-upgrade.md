# PeerTube upgrade path (analysis, October 2026)

Context for the video proof of concept on this branch: portal videos could be hosted on a PeerTube instance instead of S3. The instance considered ran PeerTube 4.2.2 with PostgreSQL 10 and Redis 6. This note records the upgrade path worked out on 2026-10-12. Nothing was applied.

## Target

| | Current | Target |
|---|---|---|
| PeerTube | 4.2.2 | 8.3.0 |
| PostgreSQL | 10 | 17 (8.3 requires 14 or later) |
| Redis | 6 | 8 |

## Steps, in order

1. Backup: `pg_dump` of the database, copy of `/data` and `/config`.
2. PostgreSQL 10 to 17 and Redis 6 to 8, independent from PeerTube and low risk. Changing the image tag is not enough (PostgreSQL 17 does not start on a version 10 data directory): dump, restore into a new volume, switch, keep the old volume as the rollback.
3. PeerTube 4.2.2 to 8.3.0 in stages, 5.2, 6.3, 7.3 then 8.3, running the manual migration script of each stage in the pod with PeerTube started. What breaks:
   - new mandatory `PEERTUBE_SECRET` (5.0);
   - `storage.videos` becomes `storage.web_videos` (6.0), `storage.uploads` must be set (8.0), `web-videos/` directory (7.2);
   - the `-bullseye` image tags are gone, use `vX.Y.Z`;
   - check that any init container still copies the right config paths from the image;
   - the 8.0 migrations can take 30 minutes, and 5.0 and 6.3 move video files: check the free space of the data volume first;
   - retest upload, playback and download behind the ingress (nginx I/O fix in 8.2).
4. Videos on S3, after the upgrade and not before (object storage support matured in 5.0 to 7, doing it on 4.2.2 would mean replaying the ACL migration). `create-move-video-storage-job` moves the videos one by one while the instance runs. Thumbnails, avatars, torrents, cache and transcoding stay on disk: the volume remains, smaller.
5. Automated backup of the database (a `pg_dump` CronJob to an existing bucket) and of the remaining volume.

PostgreSQL and Redis both stay after the move to S3: the database holds accounts, channels, video metadata and federation state, and Redis holds the job queue (transcoding, federation, mails). A dedicated small PostgreSQL is the right size for a single client; a Postgres operator is not worth it for one service.
