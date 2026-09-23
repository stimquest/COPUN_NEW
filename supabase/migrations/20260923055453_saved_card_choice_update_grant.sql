-- The UPDATE policy alone does not grant the table privilege required by upsert.
-- Row ownership is still enforced by saved_cards_update_own.
grant update (accroche_choisie, action_id, user_id, content_id) on public.saved_pedagogical_cards to authenticated;
