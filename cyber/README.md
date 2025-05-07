# Password Verification Tool

A secure and ethical password verification tool designed for legitimate security testing and research purposes.

## Features

- Multiple hash algorithm support (bcrypt, MD5, SHA-256)
- Rate limiting and request throttling
- Comprehensive audit logging
- Password strength analysis
- Configurable verification parameters
- RESTful API interface

## Installation

```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

2. Make a verification request:
```bash
curl -X POST http://localhost:3000/verify \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "your_hash_here",
    "context": {
      "algorithm": "bcrypt",
      "saltRounds": 10
    }
  }'
```

## Security Features

- Rate limiting per IP address
- Request validation and sanitization
- Audit logging of all verification attempts
- Configurable timeouts and attempt limits
- Secure error handling

## Ethical Usage

This tool is designed for:
- Security research
- Penetration testing (with proper authorization)
- System security audits
- Educational purposes

## License

Custom License - See LICENSE file for details

This software is licensed under a custom license that includes:
- Non-commercial use only
- No AI use or training
- Ethical usage requirements
- Attribution requirements

Please review the LICENSE file for complete terms and conditions.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 