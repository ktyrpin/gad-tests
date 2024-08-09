import { registrationAndLogin, checkCookiesAfterLogout } from '../support/commands';

describe('Logout - Happy path, should allow users to logout', () => {
	beforeEach(() => {
		cy.visit('register.html');
		registrationAndLogin();
	});

	afterEach(() => {
		checkCookiesAfterLogout();
	});

	it('logout using button "logout"', () => {
		cy.get('[data-testid="logoutButton"]').click();
		cy.url({ timeout: 10000 }).should('include', 'login');
	});

	it('logout using button on the navbar after hovering over the avatar icon', () => {
		cy.get('[data-testid="user-dropdown"]').trigger('mouseenter');
		cy.get('#logoutBtn').click({ force: true });
		cy.url({ timeout: 10000 }).should('include', 'login');
	});
});
