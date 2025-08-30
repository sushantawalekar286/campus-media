const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

class GoogleCalendarService {
    constructor() {
        // You'll need to set up Google Cloud Console and get these credentials
        this.clientId = process.env.GOOGLE_CLIENT_ID || 'your-client-id';
        this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret';
        this.redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
        
        this.oauth2Client = new OAuth2Client(
            this.clientId,
            this.clientSecret,
            this.redirectUri
        );
    }

    // Generate authorization URL
    getAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    }

    // Exchange authorization code for tokens
    async getTokensFromCode(code) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            return tokens;
        } catch (error) {
            console.error('Error getting tokens:', error);
            throw error;
        }
    }

    // Set credentials (for when you have stored tokens)
    setCredentials(tokens) {
        this.oauth2Client.setCredentials(tokens);
    }

    // Create calendar event with Google Meet
    async createInterviewEvent(interviewData) {
        try {
            // Check if we have stored tokens
            if (global.googleTokens) {
                this.oauth2Client.setCredentials(global.googleTokens);
            } else {
                throw new Error('Google Calendar not connected. Please authenticate first.');
            }
            
            const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
            
            const startTime = new Date(interviewData.preferredDate);
            const endTime = new Date(startTime.getTime() + interviewData.duration * 60000);

            const event = {
                summary: `Mock Interview - ${interviewData.role} (${interviewData.interviewType})`,
                description: `Mock Interview Request\n\nRole: ${interviewData.role}\nType: ${interviewData.interviewType}\nDuration: ${interviewData.duration} minutes\n\nNotes: ${interviewData.notes || 'No additional notes'}`,
                start: {
                    dateTime: startTime.toISOString(),
                    timeZone: 'Asia/Kolkata',
                },
                end: {
                    dateTime: endTime.toISOString(),
                    timeZone: 'Asia/Kolkata',
                },
                attendees: [
                    { email: interviewData.requesterEmail },
                    { email: interviewData.interviewerEmail }
                ],
                conferenceData: {
                    createRequest: {
                        requestId: `interview-${Date.now()}`,
                        conferenceSolutionKey: {
                            type: 'hangoutsMeet'
                        }
                    }
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 },
                        { method: 'popup', minutes: 30 },
                    ],
                },
            };

            const response = await calendar.events.insert({
                calendarId: 'primary',
                resource: event,
                conferenceDataVersion: 1,
                sendUpdates: 'all'
            });

            return {
                eventId: response.data.id,
                meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri || null,
                eventLink: response.data.htmlLink
            };
        } catch (error) {
            console.error('Error creating calendar event:', error);
            throw error;
        }
    }

    // Update calendar event
    async updateInterviewEvent(eventId, interviewData) {
        try {
            const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
            
            const startTime = new Date(interviewData.preferredDate);
            const endTime = new Date(startTime.getTime() + interviewData.duration * 60000);

            const event = {
                summary: `Mock Interview - ${interviewData.role} (${interviewData.interviewType})`,
                description: `Mock Interview Request\n\nRole: ${interviewData.role}\nType: ${interviewData.interviewType}\nDuration: ${interviewData.duration} minutes\n\nNotes: ${interviewData.notes || 'No additional notes'}`,
                start: {
                    dateTime: startTime.toISOString(),
                    timeZone: 'Asia/Kolkata',
                },
                end: {
                    dateTime: endTime.toISOString(),
                    timeZone: 'Asia/Kolkata',
                },
                attendees: [
                    { email: interviewData.requesterEmail },
                    { email: interviewData.interviewerEmail }
                ]
            };

            const response = await calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                resource: event,
                sendUpdates: 'all'
            });

            return response.data;
        } catch (error) {
            console.error('Error updating calendar event:', error);
            throw error;
        }
    }

    // Delete calendar event
    async deleteInterviewEvent(eventId) {
        try {
            const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
            
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
                sendUpdates: 'all'
            });

            return true;
        } catch (error) {
            console.error('Error deleting calendar event:', error);
            throw error;
        }
    }

    // Generate a simple Meet link (fallback)
    generateMeetLink() {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        return `https://meet.google.com/${randomId}-${timestamp.toString(36)}`;
    }
}

module.exports = new GoogleCalendarService();
