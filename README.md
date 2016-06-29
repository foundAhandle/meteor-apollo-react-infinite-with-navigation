React Infinite With Navigation Using Meteor And Apollo (GraphQL)
===

**Infinite scroll with navigation using the react-bootstrap Pagination component, meteor, and the apollo project**

- loads results on forward scroll only
- can handle sudden quick scrolls in either direction
- easily change the minimum number of results per load
- having navigation links allows for faster traversal of results
- uses the javascript <a href="https://www.meteor.com" target="_blank">meteor</a> platform
- uses the <a href="http://www.apollostack.com" target="_blank">apollo</a> stack for a <a href="https://facebook.github.io/react/blog/2015/05/01/graphql-introduction.html" target="_blank">graphql</a> sql db connection

<a href="https://jsfiddle.net/gs5bpsp3" target="_blank">JSFiddle example of </a><a href="https://github.com/foundAhandle/react-infinite-with-navigation" target="_blank">react-infinite-with-navigation</a>

`npm install meteor-apollo-react-infinite-with-navigation`

## To create a test database
This example pulls names from a mysql database. In order to create the test db, enter a user name and password for the sql connection in programs/insert.js.

Then run the script: `node programs/insert.js`.

## To run the example
`cd meteor-apollo-react-infinite-with-navigation`

`meteor`

open <a href="http://localhost:3000" target="_blank">localhost:3000</a> in your browser to see the example

<a href="https://github.com/graphql/graphiql" target="_blank">graphiql</a> is available at <a href="http://localhost:4000" target="_blank">localhost:4000</a>
