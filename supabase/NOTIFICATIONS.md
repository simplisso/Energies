# Notifications de demandes

La fonction `functions/notify-lead/index.ts` envoie un e-mail après l'insertion d'une nouvelle demande. Elle doit être déclenchée par un webhook de base de données Supabase et vérifie le secret `x-lead-webhook-secret`.

## Test sans domaine

Pour un premier test, aucun domaine n'est nécessaire. Dans les secrets Supabase, utiliser `onboarding@resend.dev` comme `RESEND_FROM_EMAIL` et l'adresse du compte Resend comme `CONTACT_NOTIFICATION_EMAIL`. Resend limite son expéditeur de test à cette adresse vérifiée ; cet expéditeur ne convient pas à la production.

## Envoi en production

- Avoir un domaine d'expédition vérifié dans Resend.
- Installer le [Supabase CLI](https://supabase.com/docs/guides/cli) et l’utiliser depuis la racine du dépôt.
- Ne jamais ajouter les valeurs des secrets dans Git ni les envoyer dans une conversation.

## Déploiement

1. Se connecter au CLI et lier le projet :

```sh
supabase login
supabase link --project-ref owkprsgfbxaxkijcomln
```

Le CLI demande un jeton Supabase dans le terminal. Ne le partage pas dans une conversation.

2. Dans Supabase, ouvrir **Project Settings → Edge Functions → Secrets** et ajouter :

- `RESEND_API_KEY` : clé API Resend.
- `CONTACT_NOTIFICATION_EMAIL` : adresse qui recevra les demandes.
- `RESEND_FROM_EMAIL` : adresse d'expédition vérifiée dans Resend.
- `LEAD_WEBHOOK_SECRET` : secret aléatoire partagé avec le webhook. Générer localement une valeur avec `openssl rand -hex 32`.

3. Déployer la fonction sans vérification JWT intégrée : elle vérifie elle-même le secret partagé du webhook.

```sh
supabase functions deploy notify-lead
```

4. Ouvrir **Database → Webhooks**, créer un webhook sur `public.leads`, événement **INSERT**, méthode **POST**, et utiliser l'URL de la fonction `notify-lead`. Ajouter l'en-tête `x-lead-webhook-secret` avec la même valeur que `LEAD_WEBHOOK_SECRET`.

La fonction ignore les autres événements et exige ce secret avant de contacter Resend.
