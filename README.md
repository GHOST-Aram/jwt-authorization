## Securing Express API Endpoints using JSON Web Tokens.

What are JSON Web Tokens (JWT) ? There is a possibility that you have interacted with applications that uses some kind of technology to authorize users for their products. These are oftenly services and products that are accessed based on subscriptions that expire after some time. One of the freely available technologies for restricting customer access to digital products and services is JWT. Using JWT, you can allow limited and renewable access to digital products and services. In this article, we will discuss and demonstrate how to use JWT to provide consumers with limited and renewable access to selected API endpoints of an application.


## What we will cover.
To fully demonstrate how to use JWT to secure your API services, we will cover the following topics in this article:

- Issuing JWT to consumers
- Using the Passport framework to verify tokens and secure endpoints.

As mentioned earlier, JWT authorization assumes that the user is already registered and authenticated on your system. It would be nice if we could implement user authentication strategies too but that is beyond the scope of this article. 

## Audience and prerequisites
This article is aimed towards beginner programmers looking for a guide on how to implement JWT authorization on their backend APIs. In order to get learn effectively from this article, beginners are recommended to have basic knowledge on the following:
- Building simple CRUD backends with Node and Express
- Testing API endpoints with Postman, Insomnia or any other API tesing software.
- Working with Typescript (Optional)


To achive the objectives of this article well will carry out the following activities:

1. Issue token.
2. Configure passport jwt
3. Secure routes with passport-jwt.


## 1. Issue token
Before we can use a JSON web token to secure routes in our application, we have to create and provide it to the user. To create a JSON web token, we need the `jsonwebtoken` modules. We install the module as follows:

```
npm i jsonwebtoken
```

We will create a post route called `/get-token` to issue the token. The we will create the token using username and email provided within the request body. Below is the implementation of the `get-token` route.

```
app.post('/get-token', (
    req: Request, res: Response, next: NextFunction
) =>{
    const secretOrKey = process.env.TOKEN_SECRET
    try {
        const token = jwt.sign({
			email: req.user.email, 
			username: req.user.username
		},
		secretOrKey, {
			expiresIn: '36m',
			subject: user.id
		})

        res.json({ token })
    } catch (error) {
        next(error)
    }
})
```
You can test the route to affirm that it is operational. Here is the expected outcome. Be sure that my token will not be identical to yours.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/mvlo3i7w9lc4nwieoro4.png)

## 2. Configure Passport
In securing routes, we will use passport-jwt strategy. In this step, we configure the strategy so thatwe can use it in the next section. 

To implements the configuration, we need two key modules, `passport` and `passport-jwt`. Install them using the following command.

```
npm i passport passport-jwt
```

Here is the impelementation:

```
passport.use(new Strategy({
		secretOrKey: process.env.TOKEN_SECRET,
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	},async (jwt_payload: JwtPayload, done: DoneCallback) => {
		try {
			const user = await User.findById(
				jwt_payload.sub, '-password -__v'
			)
			if(user){
				return done(null, user)
			} else{
				return done(null, false)
			}
		} catch (error) {
			return done(error, false)
		}
  	}))
```
In the above implementation, passport uses the information provided in the options object to decode the token. Once the token is decoded, passport supplies the user information to our verify function as `jwt_payload` object.

The `jwt_payload` object contains the user data that was used to create the token. In the previous section, we assigned user Id to the `subject` property of the token. In the above implementation, we get the user id from `jwt_payload.sub`

We use the user id to get the user data from the database. While we fetch the user data, we exclude the password for security reasons. We also exclude the version key because its not such an important detail to the user.

Finally, if we find the user with the id that was stored in the token, we return the user and passport takes over. Passport then attaches the user object to the `req` object. The user can now access the route that required the token.

## 3. Secure Routes
This is the simplest part of the whole exercise. All you need to do is call `passport.authenticate` function in the list of route handlers to the route you want to protect. This can be done as shown below.

```
app.get('/profile/:userId', 
	passport.authenticate('jwt', { session: false}),
	(req, res) =>{
		res.json({ message: "Access granted" })
})
```
 