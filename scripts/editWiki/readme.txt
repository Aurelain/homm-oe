1. get your credentials from https://wiki.hoodedhorse.com/Heroes_of_Might_and_Magic_Olden_Era/Special:BotPasswords
2. place them in volatile/SECRET.js
3. npm run target /path/to/file/Cargo.lua. This will fill the value in volatile/TARGET.js
4. Open the webpage in a browser: https://wiki.hoodedhorse.com/Heroes_of_Might_and_Magic_Olden_Era/api.php
5. From the Console>Network tab: copy the user-agent and paste it into volatile/CF.js
6. From the Console>Application>Cookies tab: copy the cf_clearance and paste it into volatile/CF.js
7. npm run build
8. edit
9. npm run refresh