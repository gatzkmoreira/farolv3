/**
 * FarolV3 - Event API Contracts
 * Matching workflow: FarolV3 - API Event (QFnKJy10Tt9RQ2XK)
 * Endpoint: POST /webhook/event
 */

// ============= EVENT TYPES =============

export type EventType =
    | 'search_submitted'
    | 'chip_clicked'
    | 'card_clicked'
    | 'external_link_clicked'
    | 'feedback_given'
    | 'page_view'
    | 'error';

// ============= REQUEST =============

export interface EventRequest {
    session_id?: string;                    // Optional session reference
    event_type: EventType;                  // Required
    payload?: Record<string, unknown>;      // Event-specific data
}

// ============= RESPONSE =============

export interface EventResponseData {
    event_id: string | null;
}

export interface EventResponse {
    success: boolean;
    data?: EventResponseData;
    error?: {
        code: 'VALIDATION_ERROR';
        message: string;
    };
}
