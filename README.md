# Story-teler — Créateur d’histoires interactives

Mono-repo **pnpm** : application **React (Vite) + MUI** pour le front, **NestJS + TypeORM + SQLite** pour l’API. Les auteurs créent des histoires à embranchements (pages + choix) ; les lecteurs parcourent le récit depuis la page de départ.

## Prérequis

- [Node.js](https://nodejs.org/) **18.17+** (idéal : **20 LTS** ou 22)
- [pnpm](https://pnpm.io/) 8+

Sous **Node 18** : (1) un polyfill charge **`globalThis.crypto`** avant Nest, car `@nestjs/typeorm` utilise `crypto.randomUUID()` (global absent avant Node 19) ; (2) une override pnpm ciblée **`path-scurry>lru-cache`** évite `tracingChannel` (API Node 20+) **sans** remplacer le `lru-cache` attendu par Babel / Vite (sinon erreur `_lruCache is not a constructor` sur le front).

## Où se placer dans le dépôt ?

Après `git clone`, tu obtiens un dossier (souvent `story-teller` ou `Story-teler`) : c’est la **racine du dépôt Git** — celle qui contient `package.json`, `pnpm-workspace.yaml` et le dossier **`apps/`**.

- **C’est depuis cette racine** qu’il faut lancer **`pnpm install`**, **`pnpm dev:api`**, **`pnpm dev:web`**, etc. Les scripts du `package.json` racine orchestrent les paquets du workspace.
- Le dossier **`apps/`** n’est pas la racine pnpm : il regroupe seulement **`apps/api`** (NestJS) et **`apps/web`** (Vite). Il n’y a pas de `package.json` directement dans `apps/`, donc **`cd apps` puis `pnpm install` ne suffit pas** pour installer tout le mono-repo.

Si tu ouvres le projet dans l’IDE, ouvre le **dossier racine du clone** (parent de `apps/`), pas uniquement `apps/api` ou `apps/web`, pour que les chemins et le workspace correspondent au README.

## Installation

À la **racine du dépôt** (le dossier qui contient `pnpm-workspace.yaml`) :

```bash
pnpm install
```

### Configuration de l’API

Copiez le fichier d’exemple puis ajustez si besoin :

```bash
copy apps\api\.env.example apps\api\.env
```

Sous Unix :

```bash
cp apps/api/.env.example apps/api/.env
```

Variables :

| Variable        | Description                          |
|-----------------|--------------------------------------|
| `PORT`          | Port HTTP de l’API (défaut `3000`)   |
| `JWT_SECRET`    | Secret de signature des JWT          |
| `DATABASE_PATH` | Chemin du fichier SQLite             |

## Lancer en local

Toujours depuis la **racine du dépôt** (même dossier que pour `pnpm install`). Deux terminaux :

**1. API**

```bash
pnpm dev:api
```

L’API écoute sur `http://localhost:3000` avec le préfixe global `/api` (ex. `http://localhost:3000/api/stories`).

**2. Front**

```bash
pnpm dev:web
```

L’interface est sur `http://localhost:5173`. Le proxy Vite redirige `/api` vers le port 3000.

## Scripts utiles

| Commande        | Action                    |
|-----------------|---------------------------|
| `pnpm dev:api`  | API Nest en mode watch    |
| `pnpm dev:web`  | Front Vite en mode dev    |
| `pnpm build`    | Build api + web           |
| `pnpm --filter api test` | Tests unitaires api |

## Parcours MVP

1. Créer un compte (**Inscription**), puis **Nouvelle histoire**.
2. Dans l’éditeur : ajouter des pages, définir la **page de départ**, relier les pages avec des **choix** (libellé + destination).
3. Sur l’accueil, **Lire** ouvre la lecture depuis la page de départ ; une page sans choix termine l’histoire.

## Structure du dépôt

```text
<racine du clone>/
  package.json          # scripts dev:api, dev:web, build…
  pnpm-workspace.yaml
  apps/
    api/                # NestJS
    web/                # React + Vite + MUI
```

Les applications « vivent » sous **`apps/`**, mais les **commandes pnpm du README se lancent à la racine** (`<racine du clone>/`), pas dans `apps/`.

La persistance utilise **SQLite via sql.js** (WebAssembly, pas de binaire natif) : pas de conflit `NODE_MODULE_VERSION` quand tu passes de Node 22 à Node 18 ou l’inverse. Le fichier est créé / mis à jour automatiquement (`autoSave` + `synchronize: true`, usage limité au développement / démo).

## Dépannage

### `Error: listen EADDRINUSE :::3000`

Un autre processus utilise déjà le port **3000** (souvent une ancienne instance de l’API). Ferme l’autre terminal (`Ctrl+C`) ou change le port dans `apps/api/.env` :

```env
PORT=3001
```

Si l’API n’est plus sur 3000, indique la même URL au front (fichier `apps/web/.env`, copié depuis `apps/web/.env.example`) :

```env
VITE_API_PROXY=http://localhost:3001
```

Puis relance `pnpm dev:web`.

### `tracingChannel is not a function` (Node 18)

À la racine, exécute `pnpm install` pour appliquer l’override **`path-scurry>lru-cache`** du `package.json`, ou passe à **Node 20 LTS**.

### `crypto is not defined` au démarrage de l’API (Node 18)

Le fichier `apps/api/src/polyfills.node18.ts` est importé en premier dans `main.ts`. Vérifie que tu n’as pas retiré cet import.

### `_lruCache is not a constructor` avec Vite / Babel

Cause habituelle : override **globale** de `lru-cache` (remplace la v5 utilisée par Babel). Ce dépôt n’utilise qu’une override **ciblée** ; refais un `pnpm install` à la racine après `git pull`.

### Vite : `EBUSY: resource busy or locked` (`.vite/deps`)

Souvent sous **Windows** : antivirus, indexation ou **deux instances** de `pnpm dev:web` qui touchent au cache. Arrête tous les Vite (`Ctrl+C`), supprime le dossier `apps/web/.vite` (et au besoin `apps/web/node_modules/.vite`), puis relance **un seul** `pnpm dev:web`. Le projet place le cache Vite dans `apps/web/.vite` pour limiter ce problème.

### `NODE_MODULE_VERSION` / module natif (ex. ancien `better-sqlite3`)

Si tu vois encore ce message après un ancien clone : supprime `node_modules` et relance `pnpm install`. L’API utilise désormais **sql.js** (pas de `better_sqlite3.node`). Si un jour tu réintroduis un module natif (`bcrypt`, etc.) et changes de version Node, exécute `pnpm rebuild` pour ce paquet ou réinstalle les dépendances.

### La page d’accueil affiche une erreur réseau

Le front appelle `/api/...` via le proxy Vite vers **localhost:3000**. L’API doit être **démarrée avant** (ou en parallèle) avec `pnpm dev:api`. Sans API, le navigateur obtient une erreur de connexion.
