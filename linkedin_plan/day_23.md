# Day 23: Geospatial Data: PostGIS vs. The Rest (Dev Pillar)
**Hook:** When you're building a fitness app like **run.to**, GPS data is messy. You need a backend that can handle it.

Most developers reach for a basic JSON field to store coordinates. I reached for **PostGIS on Supabase.**

Why? 
- **Distance-based logic:** Calculating "ghost routes" and crowd radar in real-time.
- **Spatial Indexing:** Querying thousands of activity points with zero lag.
- **Relational Integrity:** Linking GPS data directly to user profiles and activity state.

If your app lives in the "Real World," your database needs to understand geography, not just strings.

**CTA:** Have you ever used PostGIS or another geospatial engine? What was your use case?
