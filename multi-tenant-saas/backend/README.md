the express server will crash on every dupluicate email or UUID unless we build a vaildation layeer and POSTGRESQL error middleware . 
INPUT VALIDATION : 
if a client send ivalid-id or omits the required field like name PostgresQL will throw hard execution error code 22p02  it will waste compute time and network round trips while quering with neon  so we have to validate the incoming data at the express layer before it ever touches the database .So we will be USING ZOD enforce strict schemas for req.body and req.params

//////////

now when postgresql rejects a write due to database constraint eg slug violation it will return internal error code like 23505 so if route catches it with res.json({}) then it will leak internal schema names to user and return a generic serveer crash instead of clear client error so we will use middleware and codes to handle errors
Postgres Error Codes to Handle:
23505 -> 409 Conflict (Unique constraint violation, e.g., duplicate email or slug).

23503 -> 400 Bad Request (Foreign key violation, e.g., assigning a branch to a non-existent tenant).

22P02 -> 400 Bad Request (Invalid data type, e.g., bad UUID string).