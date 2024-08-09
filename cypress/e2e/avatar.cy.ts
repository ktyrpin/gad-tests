import { userRegistration, checkUserRegistration, userLogin, checkAvatar, checkUserLogin } from '../support/commands';

beforeEach(() => {
	cy.visit('register.html');
});

describe('Avatar', () => {
	it('checking avatar changes', () => {
		cy.get('.avatar')
			.find('option')
			.then(options => {
				const numberOfAvatars = options.length;
				for (let i = 0; i < 5; i++) {
					cy.get('.avatar').select(i).should('have.value', options[i].value);
				}
				cy.get('.avatar').select(0).should('have.value', options[0].value);

				// Registration

				userRegistration();
				checkUserRegistration(true);

				// Logging

				userLogin(false);
				checkUserLogin(true, true);

				// Checking if avatar src is equal to cookie "avatar" value
				checkAvatar();
			});
	});
});
