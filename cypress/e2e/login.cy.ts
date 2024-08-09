import { checkCookiesAfterLogin, checkDeletingCookiesAfterLogin, checkUserLogin, userLogin } from '../support/commands';

describe('Login - Happy Path, should allow users to login', () => {
	beforeEach(() => {
		cy.visit('login');
		userLogin(true);
	});

	it('login with checking the "keep me sign in" button, checking cookies', () => {
		// verify that the user was correctly logged in, while logging click the “keep me sign in” button
		checkUserLogin(true, true);
		// Checking cookies ater log-in, checking whether the user has been logged out after deleting cookies
		checkCookiesAfterLogin();
		checkDeletingCookiesAfterLogin();
	});

	it('login without checking the "keep me sign in" button', () => {
		// verify that the user was correctly logged in
		checkUserLogin(false, true);
	});
});

describe('Login - Unhappy Path, should not allow users to login', () => {
	beforeEach(function () {
		cy.visit('login');
		cy.fixture('userData').as('loginData');
	});
	afterEach(() => {
		checkUserLogin(false, false);
	});

	it('login with wrong email address', function () {
		cy.get(':nth-child(2) > #username').type(this.loginData.wrongEmail);
	});

	it('login with wrong password', function () {
		cy.get('#password').type(this.loginData.wrongPassword);
	});
});
