# Anne-Charlotte · Art-thérapeute à Lille

Landing page statique (HTML / CSS / JS natif, sans dépendance ni build).

```
index.html          contenu et structure
assets/style.css    design (palette brique · ocre · sauge · indigo · rose)
assets/main.js      interactions
```

Ouvrir `index.html` dans un navigateur, ou servir le dossier : `npx http-server .`

## Expériences clés
- **Hero « peignez ici »** : le visiteur peint à l'aquarelle avec sa souris ou son doigt ; un premier coup de pinceau se dessine tout seul pour l'y inviter.
- **« Quelle couleur vous habite aujourd'hui ? »** : une palette de gouttes, chacune avec un message.
- **Ce n'est pas… / c'est…** : les idées reçues sont barrées au pinceau, remplacées par une phrase manuscrite.
- Chemin des étapes tracé au scroll, cartes qui s'imprègnent de couleur, marquee, CTA flottant.
- Accessible : navigation clavier, `prefers-reduced-motion` respecté, contrastes, labels.

## À personnaliser avant la mise en ligne
- [ ] Photo d'Anne-Charlotte (`.portrait__frame`, commentaire dans `index.html`)
- [ ] Téléphone, e-mail (`index.html` + constante `TO` dans `assets/main.js`)
- [ ] Parcours, diplôme, école de formation, fédération éventuelle (section « Qui suis-je »)
- [ ] Tarifs et durées
- [ ] Témoignages : ceux présents sont des **exemples**, à remplacer par de vrais retours (avec accord)
- [ ] Formulaire : ouvre actuellement le client mail ; brancher Formspree / Netlify Forms pour un envoi direct
- [ ] Mentions légales et politique de confidentialité
