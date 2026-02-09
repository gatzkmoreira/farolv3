/**
 * FarolV3 - Feedback API Contracts
 * Matching workflow: FarolV3 - API Feedback (wT69mJ7gFKdAXTXf)
 * Endpoint: POST /webhook/feedback
 */

// ============= REQUEST =============

export type FeedbackRating = 'positive' | 'negative';

export interface FeedbackRequest {
    ai_output_id: string;           // Required - ID of the AI output being rated
    session_id?: string;            // Optional session reference
    rating: FeedbackRating;         // Required - positive or negative
    comment?: string;               // Optional user comment
}

// ============= RESPONSE =============

export interface FeedbackResponse {
    success: boolean;
    error?: {
        code: 'VALIDATION_ERROR';
        message: string;
    };
}
