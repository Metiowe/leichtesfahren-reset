# Du solltest 200 oder 308 → 200 erhalten, nicht 401.

curl -I https://leichtesfahren-reset.vercel.app

# Dann:

curl -i https://leichtesfahren-reset.vercel.app/api/reset/request \

-H "Content-Type: application/json" \
 -d '{"email":"test@example.com"}'

# Abschluss:

# Appwrite Recovery-Redirect-URL:

https://leichtesfahren-reset.vercel.app/reset

# 2.2 OTP prüfen (wenn Mail da ist)

curl -i -X POST https://leichtesfahren-reset.vercel.app/api/reset/verify \
 -H 'Content-Type: application/json' \
 -d '{"email":"metiowen66@gmail.com","otp":"123456"}'

# 2.3 Optional: Reset-Token holen (falls du das trennst)

curl -i -X POST https://leichtesfahren-reset.vercel.app/api/reset/token \
 -H 'Content-Type: application/json' \
 -d '{"email":"metiowen66@gmail.com"}'

# 2.4 Neues Passwort setzen

curl -i -X POST https://leichtesfahren-reset.vercel.app/api/reset/confirm \
 -H 'Content-Type: application/json' \
 -d '{
"email":"metiowen66@gmail.com",
"resetToken":"<falls dein Backend das nutzt>",
"newPassword":"NeuesPasswort123"
}'

# YES!

curl -i -X POST 'https://fra.cloud.appwrite.io/v1/account/recovery' \
 -H 'Content-Type: application/json' \
 -H 'X-Appwrite-Project: 68ac1cb6000fdd4c3031' \
 -d '{"email":"metiowen66@gmail.com","url":"https://leichtesfahren-reset.vercel.app/reset"}'

# Starte deinen cURL-Test nochmal:

curl -i -X POST 'https://fra.cloud.appwrite.io/v1/account/recovery' \
 -H 'Content-Type: application/json' \
 -H 'X-Appwrite-Project: 68ac1cb6000fdd4c3031' \
 -d '{"email":"metiowen66@gmail.com","url":"https://leichtesfahren-reset.vercel.app/reset"}'
