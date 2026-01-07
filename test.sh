TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJqdGkiOiIwMTliOTYyZS1hZjhlLTc2NmItODdmMC0wZGQzNmZjMTIxNjYiLCJ0eXBlIjoicmVmcmVzaCJ9.kiltpzanhF3dNmvUc1vNLmdBImf9SC7ceu9g6O-fMlE"

for i in {1..10}; do 
curl -i -X POST "http://127.0.0.1:8000/v1/login" \
  -b "refresh_token=$TOKEN" \
  -d '{"email":"awdeafa", "password":"@Aa123456781"}' \
  -H "Content-Type: application/json" \
  # --cookie "refresh_token=$TOKEN" \
done

