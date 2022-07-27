import { expect } from 'chai';
import { stub } from 'sinon';

import { User } from '../models/user';
import { login } from '../controllers/auth';

describe('Auth controller - login', () => {
  it('Should throw an error with code 500 if accessing the database fails', (done) => {
    stub(User, 'findOne');

    (User.findOne as any).throws();

    const request = {
      body: {
        email: 'test@test.com',
        password: 'test'
      }
    };

    (login(request as any, {} as any, () => {}) as any).then((result) => {
      expect(result).to.be.an('error');
      expect(result).to.have.property('statusCode', 500);
      done();
    });

    (User.findOne as any).restore();
  });
});
