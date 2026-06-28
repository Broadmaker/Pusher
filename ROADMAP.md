# Feature Roadmap

## Near-term (MVP+)

- [ ] **Scheduled sends** — pick a date/time for delayed delivery
- [ ] **Delivery analytics** — success/fail/open rates per notification
- [ ] **Segments & tags** — target specific device groups (e.g. "iOS users", "US region")
- [ ] **API key rotation** — regenerate keys, revoke compromised ones
- [ ] **App name editing & deletion** — basic CRUD from settings page
- [ ] **Real API integration** — replace mock data with actual FCM/Web Push

## Mid-term

- [ ] **Webhook callbacks** — notify your customers on delivery events
- [ ] **Multi-user / team access** — invite members to manage apps
- [ ] **Rate limiting & throttling** — per-key limits to prevent abuse
- [ ] **Notification templates with variables** — `{{username}}`, `{{date}}` placeholders
- [ ] **Bulk CSV import** — upload device tokens in bulk
- [ ] **Activity log** — audit trail of who sent what

## Long-term

- [ ] **A/B testing** — test two message variants
- [ ] **Automated triggers** — webhook → auto-send notification
- [ ] **Billing & usage tracking** — per-notification pricing
- [ ] **Multi-channel** — add email/SMS alongside push
- [ ] **Admin dashboard** — platform-wide analytics for you (the SaaS owner)
- [ ] **Cloudflare D1 migration** — move from mock DB to real D1
