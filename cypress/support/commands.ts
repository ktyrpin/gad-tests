/// <reference types="cypress" />

import { noConflict } from 'cypress/types/lodash';
import { data } from '../fixtures/userData.json';
import { alphabet } from '../fixtures/generateEmail.json';

let email: string;

// generateEmail

export const generateEmail = () => {
	let email = '';
	for (let i = 0; i < 6; i++) {
		const randomIndex = Math.floor(Math.random() * alphabet.length);
		email += alphabet[randomIndex];
	}
	return email + '@example.com';
};

beforeEach(() => {
	cy.intercept('POST', '/api/users').as('createUser');
	email = generateEmail();
});

// Registration

export const userRegistration = () => {
	{
		cy.get('[data-testid="firstname-input"]').type(data);
		cy.get('[data-testid="lastname-input"]').type(data);
		cy.get('[data-testid="email-input"]').type(email);
		// cy.get('[data-testid="birthdate-input"]').click();
		// cy.get(':nth-child(1) > :nth-child(5) > .ui-state-default').click();
		cy.get('[data-testid="password-input"]').type(data);
	}
};
export const checkUserRegistration = (successful: boolean) => {
	if (successful) {
		cy.get('[data-testid="register-button"]').click();
		cy.wait('@createUser').its('response.statusCode').should('eq', 201);
		cy.contains('.alert-success', 'User created').should('be.visible');
	} else {
		cy.get('[data-testid="register-button"]').click()
		cy.url({ timeout: 10000 }).should('include', 'http://localhost:3000/register.html');
	}
};
export const fillInputAndCheckValidation = (selector: string, value: string, expectedErrorMessage: string) => {
	cy.get(selector).clear().type(value);
	checkUserRegistration(false);
	cy.contains(`#${selector}`, expectedErrorMessage).should('be.visible');
};
// Login

export const loginWithDataAlreadyUsed = () => {
	cy.fixture('loginData.json').then(loginData => {
		const { email, password } = loginData;
		cy.visit('login');
		cy.get(':nth-child(2) > #username').type(email);
		cy.get('#password').type(password);
	});
};

// Cookies
export const checkCookiesAfterLogin = () => {
	cy.url({ timeout: 10000 }).should('include', 'welcome');
	cy.getCookies()
		.should('have.length', 7)
		.then(cookies => {
			const expectedCookieNames = ['avatar', 'email', 'expires', 'firstname', 'id', 'token', 'username'];
			expectedCookieNames.forEach(cookieName => {
				const cookie = cookies.find(cookie => cookie.name === cookieName);
				expect(cookie, `Cookie '${cookieName}'`).to.exist;
			});
		});

	cy.url({ timeout: 10000 }).should('include', 'welcome');
};

export const checkDeletingCookiesAfterLogin = () => {
	cy.clearAllCookies();
	cy.getCookies().should('have.length', 0);

	cy.get('[data-testid="open-articles"]').click();
	cy.get('#avatar').invoke('attr', 'src').should('equal', './data/icons/user.png');
};

export const checkCookiesAfterLogout = () => {
	cy.url({ timeout: 10000 }).should('include', 'login');
	cy.getCookies()
		.should('have.length', 1)
		.then(cookies => {
			const expectedCookieName = ['expires'];
			expectedCookieName.forEach(cookieName => {
				const cookie = cookies.find(cookie => cookie.name === cookieName);
				expect(cookie, `Cookie '${cookieName}'`).to.exist;
			});
		});
};

// deleteAccount
export const confirmDelete = (confirmation: boolean) => {
	cy.get('[data-testid="deleteButton"]').click();
	cy.on('window:confirm', text => {
		expect(text).to.equal('Are you sure you want to delete your account?');
		return confirmation;
	});
	if (confirmation) {
		cy.url().should('include', 'login');
	} else {
		cy.url().should('include', 'welcome');
	}
};

// Logging
export const userLogin = (specificData: boolean) => {
	if (specificData) {
		// If login data is specific, load it from the fixture file
		cy.fixture('userData').then(loginData => {
			cy.get(':nth-child(2) > #username').type(loginData.email);
			cy.get('#password').type(loginData.data);
		});
	} else {
		// If login data is generated, use the provided data directly
		cy.get(':nth-child(2) > #username').type(email);
		cy.get('#password').type(data);
	}
};

export const checkUserLogin = (checkKeepSignIn: boolean, successful: boolean) => {
	if (checkKeepSignIn) {
		cy.get('#keepSignIn').click();
		cy.get('#loginButton').click();
	} else {
		cy.get('#loginButton').click();
	}
	if (successful) {
		cy.url({ timeout: 10000 }).should('include', 'welcome');
	} else {
		cy.get('[data-testid="login-error"]').should('be.visible').and('contain', 'Invalid username or password');
		cy.url({ timeout: 10000 }).should('include', 'login/?msg=Invalid%20username%20or%20password');
	}
};

export const registrationWithAllDataBlank = () => {
	cy.get('[data-testid="firstname-input"]').clear();
	cy.get('[data-testid="lastname-input"]').clear();
	cy.get('[data-testid="email-input"]').clear();
	cy.get('[data-testid="password-input"]').clear();
};

export const registrationAndLogin = () => {
	userRegistration();
	checkUserRegistration(true);
	userLogin(false);
	checkUserLogin(true, true);
};

// Avatar
export const avatar = () => {
	cy.get('.avatar')
		.find('option')
		.then(options => {
			const numberOfAvatars = options.length;
			for (let i = 0; i < numberOfAvatars; i++) {
				cy.get('.avatar').select(i).should('have.value', options[i].value);
			}
			cy.get('.avatar').select(0).should('have.value', options[0].value);

			// Registration
			userRegistration();

			// Logging

			userLogin(false);

			// Checking if avatar src is equal to cookie "avatar" value
			cy.getCookie('avatar').then(cookie => {
				const cookieSrc = cookie ? decodeURIComponent(cookie.value) : '';
				cy.get('#myAvatar')
					.invoke('attr', 'src')
					.then(imgSrc => {
						const cookieFilename = cookieSrc.split('\\').pop();
						const imgFilename = imgSrc.split('\\').pop();

						expect(imgFilename).to.equal(cookieFilename);
					});
			});
		});
};

export const checkAvatar = () => {
	// Checking if avatar src is equal to cookie "avatar" value
	cy.getCookie('avatar').then(cookie => {
		const cookieSrc = cookie ? decodeURIComponent(cookie.value) : '';
		cy.get('#myAvatar')
			.invoke('attr', 'src')
			.then(imgSrc => {
				const cookieFilename = cookieSrc.split('\\').pop();
				const imgFilename = imgSrc.split('\\').pop();

				expect(imgFilename).to.equal(cookieFilename);
			});
	});
};

export const requiredFields = [
	'#octavalidate_firstname',
	'#octavalidate_lastname',
	'#octavalidate_email',
	'#octavalidate_password'
];