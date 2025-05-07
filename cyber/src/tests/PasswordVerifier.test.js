const { expect } = require('chai');
const PasswordVerifier = require('../core/PasswordVerifier');
const bcrypt = require('bcryptjs');

describe('PasswordVerifier', () => {
    let verifier;

    beforeEach(() => {
        verifier = new PasswordVerifier({
            rateLimit: {
                windowMs: 1000,
                maxRequests: 10
            },
            logging: {
                level: 'error'
            }
        });
    });

    describe('verifyHash', () => {
        it('should verify a valid bcrypt hash', async () => {
            const password = 'test123';
            const hash = await bcrypt.hash(password, 10);

            const result = await verifier.verifyHash(hash, {
                algorithm: 'bcrypt',
                saltRounds: 10
            });

            expect(result).to.have.property('matched', true);
            expect(result).to.have.property('password', password);
        });

        it('should handle invalid hashes', async () => {
            const result = await verifier.verifyHash('invalid_hash', {
                algorithm: 'bcrypt',
                saltRounds: 10
            });

            expect(result).to.have.property('matched', false);
            expect(result).to.have.property('error');
        });

        it('should respect rate limits', async () => {
            const promises = Array(15).fill().map(() => 
                verifier.verifyHash('test_hash', {
                    algorithm: 'bcrypt',
                    saltRounds: 10
                })
            );

            const results = await Promise.all(promises);
            const rateLimited = results.filter(r => r.error === 'Rate limit exceeded');
            
            expect(rateLimited.length).to.be.greaterThan(0);
        });
    });

    describe('getSupportedAlgorithms', () => {
        it('should return list of supported algorithms', () => {
            const algorithms = verifier.getSupportedAlgorithms();
            expect(algorithms).to.include('bcrypt');
            expect(algorithms).to.include('md5');
            expect(algorithms).to.include('sha256');
        });
    });
}); 