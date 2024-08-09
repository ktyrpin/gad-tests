import { registrationAndLogin, confirmDelete, checkUserLogin } from '../support/commands';

describe('Delete account', () => {
	beforeEach(() => {
		cy.visit('register.html');
		registrationAndLogin();
	});

	it('should allow users to delete their accounts', () => {
		confirmDelete(true);
		checkUserLogin(false, false);
	});

	it('should allow users to cancel their delete account request', () => {
		confirmDelete(false);
	});
});
