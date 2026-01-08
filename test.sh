TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Imp3dHNlY3JldDEyMyJ9.eyJzdWIiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJlbWFpbCI6InZpdG9ybXNpMjAwNUBnbWFpbC5jb20iLCJyb2xlcyI6WyJlbnRlciIsInJlYWRfaXRlbXMiXSwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc2NzgzNDg3NiwiZXhwIjoxNzY3ODM4NDc2fQ.QibBtK1fZiBXkASf-eI8vgqvTvJUrRsU6NvFw8yG-BkwCnpNSoeWxpOqwncYfZL-eWObjnNhDM7K9cZXYWoGM-EAX3lGk-a0D_X5vE05EzMpW-CCDSvKmZFuEXcpmWWdGx6E4T2Lkj4E0sxXulKepEb99IF0-m95JUkJgjkkPUzKKKq1IKPwPWAWPt417Ch0Mh5usP1CwzUFgXeoKSkhJcg5H3VdU7DOHRQUDRq7Z8mElMZh2PMzEcz_FhvMU9lhr91zn4VoOHDXSO4qSNRLzFFne5C3d6IGehOs8HTfhdYmSBtxRDejVbPyjLalHjB1KUG0nmx1dfMVqLEkWKL0EA"

for i in {1..2}; do 
curl -i -X PATCH "http://127.0.0.1:8000/v1/user/password" \
  -b "refresh_token=$TOKEN" \
  -b "access_token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword": "@Aa12345678", "newPassword":"@Aa123456781"}' \
  # --cookie "refresh_token=$TOKEN" \
done

