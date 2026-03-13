// Database types for Supabase client
// Manually defined to match 001_initial_schema.sql
// Replace with `supabase gen types typescript` when Supabase project is connected

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          role: "admin" | "editor" | "viewer"
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string | null
          role?: "admin" | "editor" | "viewer"
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
          role?: "admin" | "editor" | "viewer"
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      channels: {
        Row: {
          id: string
          platform: string
          name: string
          account_id: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          avatar_url: string | null
          is_active: boolean | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          platform: string
          name: string
          account_id?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          avatar_url?: string | null
          is_active?: boolean | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          platform?: string
          name?: string
          account_id?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          avatar_url?: string | null
          is_active?: boolean | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          name: string
          slug: string
          color: string
          description: string | null
          start_date: string | null
          end_date: string | null
          is_active: boolean | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          color?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          color?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      hashtag_sets: {
        Row: {
          id: string
          name: string
          hashtags: string[]
          category: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          hashtags: string[]
          category?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          hashtags?: string[]
          category?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          caption: string | null
          caption_overrides: Json
          post_type: "image" | "video" | "carousel" | "text" | "story" | "reel"
          hashtags: string[]
          first_comment: string | null
          status: "draft" | "review" | "approved" | "scheduled" | "published" | "failed"
          scheduled_at: string | null
          published_at: string | null
          campaign_id: string | null
          created_by: string | null
          assigned_to: string | null
          link_id: string | null
          update_linkinbio: boolean
          platform_post_ids: Json
          publish_errors: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          caption?: string | null
          caption_overrides?: Json
          post_type?: "image" | "video" | "carousel" | "text" | "story" | "reel"
          hashtags?: string[]
          first_comment?: string | null
          status?: "draft" | "review" | "approved" | "scheduled" | "published" | "failed"
          scheduled_at?: string | null
          published_at?: string | null
          campaign_id?: string | null
          created_by?: string | null
          assigned_to?: string | null
          link_id?: string | null
          update_linkinbio?: boolean
          platform_post_ids?: Json
          publish_errors?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          caption?: string | null
          caption_overrides?: Json
          post_type?: "image" | "video" | "carousel" | "text" | "story" | "reel"
          hashtags?: string[]
          first_comment?: string | null
          status?: "draft" | "review" | "approved" | "scheduled" | "published" | "failed"
          scheduled_at?: string | null
          published_at?: string | null
          campaign_id?: string | null
          created_by?: string | null
          assigned_to?: string | null
          link_id?: string | null
          update_linkinbio?: boolean
          platform_post_ids?: Json
          publish_errors?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_channels: {
        Row: {
          post_id: string
          channel_id: string
        }
        Insert: {
          post_id: string
          channel_id: string
        }
        Update: {
          post_id?: string
          channel_id?: string
        }
        Relationships: []
      }
      post_media: {
        Row: {
          id: string
          post_id: string
          media_id: string
          position: number
          alt_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          media_id: string
          position?: number
          alt_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          media_id?: string
          position?: number
          alt_text?: string | null
          created_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          id: string
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          media_type: "image" | "video" | "gif"
          width: number | null
          height: number | null
          duration_seconds: number | null
          thumbnail_path: string | null
          tags: string[]
          uploaded_by: string | null
          usage_count: number
          created_at: string
        }
        Insert: {
          id?: string
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          media_type: "image" | "video" | "gif"
          width?: number | null
          height?: number | null
          duration_seconds?: number | null
          thumbnail_path?: string | null
          tags?: string[]
          uploaded_by?: string | null
          usage_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          media_type?: "image" | "video" | "gif"
          width?: number | null
          height?: number | null
          duration_seconds?: number | null
          thumbnail_path?: string | null
          tags?: string[]
          uploaded_by?: string | null
          usage_count?: number
          created_at?: string
        }
        Relationships: []
      }
      links: {
        Row: {
          id: string
          original_url: string
          short_code: string
          short_url: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_term: string | null
          full_url: string | null
          title: string | null
          campaign_id: string | null
          expires_at: string | null
          is_active: boolean
          click_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          original_url: string
          short_code?: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_term?: string | null
          title?: string | null
          campaign_id?: string | null
          expires_at?: string | null
          is_active?: boolean
          click_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          original_url?: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_term?: string | null
          title?: string | null
          campaign_id?: string | null
          expires_at?: string | null
          is_active?: boolean
          click_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      link_clicks: {
        Row: {
          id: string
          link_id: string
          clicked_at: string
          referrer: string | null
          user_agent: string | null
          country: string | null
          city: string | null
          device_type: string | null
          ip_hash: string | null
        }
        Insert: {
          id?: string
          link_id: string
          clicked_at?: string
          referrer?: string | null
          user_agent?: string | null
          country?: string | null
          city?: string | null
          device_type?: string | null
          ip_hash?: string | null
        }
        Update: {
          id?: string
          link_id?: string
          clicked_at?: string
          referrer?: string | null
          user_agent?: string | null
          country?: string | null
          city?: string | null
          device_type?: string | null
          ip_hash?: string | null
        }
        Relationships: []
      }
      utm_templates: {
        Row: {
          id: string
          name: string
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          is_default?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_user_role: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
  }
}
