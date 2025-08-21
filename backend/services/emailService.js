const imaps = require('imap-simple');

class EmailService {
  constructor() {
    this.config = {
      imap: {
        user: process.env.EMAIL_USER || '',
        password: process.env.EMAIL_PASSWORD || '',
        host: process.env.EMAIL_HOST || 'imap.gmail.com',
        port: process.env.EMAIL_PORT || 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
      }
    };
  }

  async connect() {
    try {
      const connection = await imaps.connect(this.config);
      return connection;
    } catch (error) {
      throw new Error(`Failed to connect to IMAP server: ${error.message}`);
    }
  }

  async getEmails(limit = 10, folder = 'INBOX') {
    try {
      const connection = await this.connect();
      
      await connection.openBox(folder);
      
      const searchCriteria = ['ALL'];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        markSeen: false,
        struct: true
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      
      const emails = messages.slice(0, limit).map(message => {
        const header = message.parts.find(part => part.which === 'HEADER');
        const text = message.parts.find(part => part.which === 'TEXT');
        
        const emailData = {
          id: message.attributes.uid,
          subject: header.body.subject?.[0] || 'No Subject',
          from: header.body.from?.[0] || 'Unknown Sender',
          to: header.body.to?.[0] || 'Unknown Recipient',
          date: header.body.date?.[0] || new Date(),
          text: text?.body || '',
          flags: message.attributes.flags || []
        };

        return emailData;
      });

      connection.end();
      return emails;
    } catch (error) {
      throw new Error(`Failed to fetch emails: ${error.message}`);
    }
  }

  async getEmailById(emailId, folder = 'INBOX') {
    try {
      const connection = await this.connect();
      
      await connection.openBox(folder);
      
      const searchCriteria = [['UID', emailId]];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        markSeen: true,
        struct: true
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      
      if (messages.length === 0) {
        connection.end();
        throw new Error('Email not found');
      }

      const message = messages[0];
      const header = message.parts.find(part => part.which === 'HEADER');
      const text = message.parts.find(part => part.which === 'TEXT');
      
      const emailData = {
        id: message.attributes.uid,
        subject: header.body.subject?.[0] || 'No Subject',
        from: header.body.from?.[0] || 'Unknown Sender',
        to: header.body.to?.[0] || 'Unknown Recipient',
        date: header.body.date?.[0] || new Date(),
        text: text?.body || '',
        flags: message.attributes.flags || []
      };

      connection.end();
      return emailData;
    } catch (error) {
      throw new Error(`Failed to fetch email: ${error.message}`);
    }
  }

  async searchEmails(searchTerm, folder = 'INBOX') {
    try {
      const connection = await this.connect();
      
      await connection.openBox(folder);
      
      const searchCriteria = [['TEXT', searchTerm]];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        markSeen: false,
        struct: true
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      
      const emails = messages.map(message => {
        const header = message.parts.find(part => part.which === 'HEADER');
        const text = message.parts.find(part => part.which === 'TEXT');
        
        const emailData = {
          id: message.attributes.uid,
          subject: header.body.subject?.[0] || 'No Subject',
          from: header.body.from?.[0] || 'Unknown Sender',
          to: header.body.to?.[0] || 'Unknown Recipient',
          date: header.body.date?.[0] || new Date(),
          text: text?.body || '',
          flags: message.attributes.flags || []
        };

        return emailData;
      });

      connection.end();
      return emails;
    } catch (error) {
      throw new Error(`Failed to search emails: ${error.message}`);
    }
  }

  async getFolders() {
    try {
      const connection = await this.connect();
      const folders = await connection.getBoxes();
      connection.end();
      return folders;
    } catch (error) {
      throw new Error(`Failed to fetch folders: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      const connection = await this.connect();
      const folders = await connection.getBoxes();
      connection.end();
      return {
        success: true,
        message: 'IMAP connection successful',
        folders: Object.keys(folders)
      };
    } catch (error) {
      return {
        success: false,
        message: 'IMAP connection failed',
        error: error.message
      };
    }
  }
}

module.exports = new EmailService();
