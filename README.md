## Simba
<img src="/public/images/simba.png" alt="logo" style="width: 60px; height: 75px;"/>

Simba is a generic tool which can be used to track any process followed in an organization with regards to the client.

Simba allows admin users to create stages, features inside the system.

where stages defines every step in process workflow and features define anything that we offer to clients.

admin can also mange users by making someone admin or revoking the access or even deleting other user from the system.

### Setup
1. Clone the repo
2. `npm install` in the root directory of the project
3. Make sure mongodb is running and set the host and port of mongodb to `SIMBA_MONGODB_HOST` and `SIMBA_MONGODB_PORT` env variables if not default host and port
4. run the command to start the app
```
node ./bin/www
```
5. Once app is up and running, register yourself as a user and run the following command in `mongo` shell to grant admin access
  ```javascript
  db.users.updateOne(
      {"username": "admin"}, {$set: {"is_admin": true}}
  )
  ```
note: change the username to the name with which you registered

6. Now refresh and see the admin related options


## References and Credits
Logo: https://pixabay.com/en/lion-animal-art-big-cat-africa-2154762/
Authentication: https://github.com/mjhea0/passport-local-express4
