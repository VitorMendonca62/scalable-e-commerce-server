db.createUser({
  user: 'vhmendonca',
  pwd: 'Vh12345678',
  roles: [
    {
      role: 'readWrite',
      db: 'auth',
    },
  ],
});
