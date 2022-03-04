# Vefforritun 2, 2022. Verkefni 3: Viðburðakerfi

Notandi að síðu stjórnenda er 'admin' og password hans 'adminPassword'.
Aðrir notendur eru 'jon' með password 'password' og 'gunni' með password 'password'.

## Vefsíða
Verkefnið keyrir á vefsíðunni https://jgh-vef2-verk3.herokuapp.com/

## Keyrsla
```
createdb vef2-v3
# setja upp .env & .env.test með tengingu í gagnagrunna
npm install
npm run setup
npm start # eða `npm run dev`
```

## Lint og prettier
Eslint er sett upp, hægt að keyra með:
```
npm run lint
```

Prettier er einnig sett upp. Hægt er að keyra með:
```
npm run prettier
```

## Test
.env.test file er í github repo, en þarf hef ég skýrt test gagnagrunninn 

Test eru keyrð með:
```
createdb vef2-v3-test
npm run setup-test
#Farið í annan terminal glugga
npm run test
```
Þetta er þar sem að sé bara keyrt upp npm start í fyrstu eru test keyrð á venjulegum gagnagrunni en ekki prófunargagnagrunni, sem er ekki fyrir bestu. Því er npm run setup-test fyrst keyrt, svo fært sig í annan terminal og keyrt npm run test.


## Að kalla á vefþjónustur með cURL
### Að sækja viðburði
```
curl --location --request GET 'https://jgh-vef2-verk3.herokuapp.com/events' \
--header 'Content-Type: application/json'
```
### Innskráning admin
```
curl --location --request POST 'https://jgh-vef2-verk3.herokuapp.com/users/login' \
--header 'Content-Type: application/json' \
--data-raw '{"username": "admin", "password": "adminPassword"}'
```
### Innskráning uppsetts notanda
```
curl --location --request POST 'https://jgh-vef2-verk3.herokuapp.com/users/login' \
--header 'Content-Type: application/json' \
--data-raw '{"username": "jon", "password": "password"}'
```
### Að skrá nýjan notanda
```
curl --location --request POST 'https://jgh-vef2-verk3.herokuapp.com/users/register' \
--header 'Content-Type: application/json' \
--data-raw '{"username": "newBoy", "password": "pword"}'
```

### Dæmi um endapunkta þar sem notandi þarf að vera loggaður inn
```
curl --location --request GET 'https://jgh-vef2-verk3.herokuapp.com/users/me' \
--header 'Authorization: Bearer YOUR_TOKEN' \
--header 'Content-Type: application/json' \
```
curl --location --request POST 'https://jgh-vef2-verk3.herokuapp.com/events' \
--header 'Authorization: Bearer YOUR_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{"name": "new-event", "description": "geggjaður nýr viðburður"}'
```
