Babel plugin to generate Jest mock files for alt actions to keep them in sync, because Jest can't.

In:

```js
class LoginActions {
	constructor() {
		this.generateActions('login', 'logout');
		this.generateActions('foo');
	}

	loginSuccessfull({token}) {
		this.dispatch({token});
	}
}
export default alt.createActions(LoginActions);
```

```sh
babel --plugins ./index.js LoginActions.js
```

Out:

```js
/*global jest*/

const LoginActions = {};
LoginActions.login = jest.genMockFunction();
LoginActions.logout = jest.genMockFunction();
LoginActions.foo = jest.genMockFunction();
LoginActions.loginSuccessfull = jest.genMockFunction();
export default LoginActions;
```
