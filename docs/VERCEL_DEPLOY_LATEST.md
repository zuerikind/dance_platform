# Deploy latest commit on Vercel

Vercel built **commit 0165146** (old). The build fix is in **093d023**.

## Deploy the latest main

1. **Vercel Dashboard** → your project → **Deployments**.
2. Click **"Create Deployment"** or **"Redeploy"** only if it lets you pick a branch/commit.
3. **Important:** Do **not** use "Redeploy" on an old deployment (that keeps the same commit 0165146).
4. Either:
   - **Option A:** Push an empty commit to trigger a new deploy from latest main:
     ```bash
     git commit --allow-empty -m "Trigger Vercel deploy from latest main"
     git push origin main
     ```
   - **Option B:** In Vercel → Settings → Git → ensure "Production Branch" is `main`, then go to Deployments → find a deployment that used commit **093d023** or **4ea4018** and promote/redeploy that, **or** connect the repo again / sync so the latest main is used.

5. After the new deploy starts, check the build log: it must show **Commit: 093d023** (or 4ea4018). If it still shows 0165146, the deployment is not using latest main.
