TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Imp3dHNlY3JldDEyMyJ9.eyJzdWIiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJqdGkiOiIwMTliOWU2MS02NGE2LTcwYTQtYjQxNC1mOGNjZjA5NDhmYWEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc2Nzg4ODc0MSwiZXhwIjoxNzY4NDkzNTQxfQ.NZqoLW-zxwbwQJtInBKJIikisHDBX0V34vvtMgr2Ww51kEWi5xWcEWwP70X1qZd2s38BGsc8E4q6yOy1Eoc0HihqClUue-hAGfUGE6YsXWtGksIKJiWTkTXIuWeMrvpAbpeUYK1t_Do5WpVvchRQhEXkAngLgOjdIFxO31JcoKIHqMZ9hbkblWZVnZAwLcf85omjQ1Nxis-67uFHBaTKQyuoHAyxWX3cciY6XYB_5Pma_LNiBrSzMjUHRAYrG_T_v84HsxRQZZzHJD5tkyjQolxjrA3kMv6zd-jJgYZrhP2n9qPAt8yeRAokUG_67e1cGtyPjC2Z8Wj3tv7b9jMe_Q"

for i in {1..150}; do 
curl -i -X POST "http://127.0.0.1:8000/v1/logout" \
  -b "refresh_token=$TOKEN" \
  -b "access_token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword": "@Aa12345678", "newPassword":"@Aa123456781"}' \
  # --cookie "refresh_token=$TOKEN" \
done

