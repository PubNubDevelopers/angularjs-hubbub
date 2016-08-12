![AngularJS Hubbub](http://cl.ly/0S3f3Q1C3q0O/Hubbub%20logo.png)

This is a full AngularJS chat app built with PubNub


![AngularJS Hubbub Screenshot](http://cl.ly/1p3A0q2m0L0j/Hubbub%20screen%20shot.png)

## Features

- Load earlier messages with infinite scroll
- Typing indicator
- Realtime user roster
- OAuth 2.0 authentication flow with Github OAuth
- Private and secure communication
- Friends list
- Direct chat 

## Roadmap 

- Sending pictures
- Group chat
- AES-256 encryption
- Digital Signature Message Verification
- IOS / Android native packaging with Ionic
- ...

## Tutorials

Learn how to build this chat app by following these easy-to-follow tutorials:

- [Getting started with PubNub’s new AngularJS SDK](https://www.pubnub.com/blog/2016-02-11-getting-started-with-pubnub-new-angularjs-sdk/)
- [Building an AngularJS Chat App Using History API with Infinite Scroll](https://www.pubnub.com/blog/2016-03-01-building-an-angularjs-chat-app-with-infinite-scroll/)
- [Building an AngularJS Chat App with a User Roster Using Presence API](https://www.pubnub.com/blog/2016-03-15-building-an-angularjs-chat-app-with-a-real-time-user-roster-and-typing-indicator-using-presence-api/)
- [Displaying a Typing Indicator in Your AngularJS Chat App Using Custom State
API](https://www.pubnub.com/blog/2016-03-21-displaying-a-typing-indicator-in-your-angularjs-chat-app/)
- [AngularJS User Authentication with OAuth 2.0 and Access Manager](https://www.pubnub.com/blog/2016-04-20-angularjs-user-authentication-with-oauth-2-access-manager/)
- [Building a Friend List using Advanced Channel Groups](https://www.pubnub.com/blog/2016-05-19-angularjs-building-a-friend-list-using-advanced-channel-groups/)

## Quick start instructions

### Obtaining OAuth Keys

- Visit [https://github.com/settings/profile](https://github.com/settings/profile)
- Select **OAuth applications** in the left panel
- Go to **Developer applications** tab, then click on the **Register new application** button
 - **Application name**: Your app name
 - **Homepage URL**: *http://localhost:3000* 
 - **Authorization callback URL**: *http://localhost:3000*
- Click on the **Register application** button
- Get your `Client ID` and `Client Secret`

### Obtaining PubNub Keys

- Visit [https://admin.pubnub.com/](https://admin.pubnub.com/) to login or create an account
- Click on the **New app** button and give it a name.
- Click on the **Create new keyset** button and give it a name
- Get your `Publish Key`, `Subscribe Key` and `Secret Key`

### Running the client

- Insert your PubNub keys, OAuth keys and server configuration in a `client/config.json` file. <br />
There is an example in the `client/sample.config.json` or below is how this file looks like:

```
{
	"PUBNUB_SUBSCRIBE_KEY": "sub-c-61b076f2-fed0-...............",
	"PUBNUB_PUBLISH_KEY": "pub-c-d22410bf-edc6-44fb-............",
	"GITHUB_CLIENT_ID": "1e439e............",
	"GITHUB_REDIRECT_URI": "http://localhost:9000/",
	"GITHUB_ACCESS_TOKEN_REQUEST_URL": "http://localhost:3000/auth/github",
	"SERVER_URL": "http://localhost:3000/"
}
```
- Execute the following commands in your terminal: 
```
cd client
bower install
npm install
grunt serve
```

Run `grunt build` for building the production app

### Running the server

- Insert your PubNub keys, OAuth keys and server configuration in a `server/.env` file. <br />
There is an example in the `server/.sample.env` or below is how this file looks like:

```
PUBNUB_SUBSCRIBE_KEY=sub-c-61b076f2-fed0-...............
PUBNUB_PUBLISH_KEY=pub-c-d22410bf-edc6-44fb-............
PUBNUB_SECRET_KEY=sec-c-MGM4ZjJkNTYtNzQ1Zi0................
SERVER_PUBNUB_AUTH_KEY=....ANY-RANDOM-STRING.....
GITHUB_CLIENT_ID=1e439e............
GITHUB_CLIENT_SECRET=3c69fde2d90e3............
GITHUB_REDIRECT_URI=http://localhost:9000/
GITHUB_ACCESS_TOKEN_REQUEST_URL=http://localhost:3000/auth/github
```

- Execute the following commands in your terminal: 
```
  cd server
  npm install
  npm start
```

