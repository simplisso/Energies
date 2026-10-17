# Notifications de demandes

La fonction `functions/notify-lead/index.ts` envoie un e-mail après l'insertion d'une nouvelle demande. Elle doit être déclenchée par un webhook de base de données Supabase et vérifie le secret `x-lead-webhook-secret`.

## Prérequis

- Avoir un compte Resend et un domaine d'expédition vérifié.
- Avoir le Supabase CLI installé, être connecté et avoir lié le projet `owkprsgfbxaxkijcomln`.
- Ne jamais ajouter les valeurs des secrets dans Git ni les envoyer dans une conversation.

## Déploiement

Définir ces secrets dans Supabase :

- `RESEND_API_KEY` : clé API Resend.
- `CONTACT_NOTIFICATION_EMAIL` : adresse qui recevra les demandes.
- `RESEND_FROM_EMAIL` : adresse d'expédition vérifiée dans Resend.
- `LEAD_WEBHOOK_SECRET` : secret aléatoire partagé avec le webhook. Générer une valeur avec `openssl rand -hex 32`.

Déployer la fonction sans la vérification JWT intégrée, car l'appel provient du webhook de base de données :

```sh
supabase functions deploy notify-lead --no-verify-jwt
```

Dans Supabase, ouvrir **Database → Webhooks**, créer un webhook sur `public.leads`, événement **INSERT**, méthode **POST**, et utiliser l'URL de la fonction `notify-lead` du projet. Ajouter l'en-tête `x-lead-webhook-secret` avec la même valeur que `LEAD_WEBHOOK_SECRET`.

La fonction ignore les autres événements et exige ce secret avant de contacter Resend.
