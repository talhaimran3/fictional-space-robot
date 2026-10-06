# ShiftPulse Admin Portal restyle + restructure

## Install map

Copy into your frontend `src/`:

```
src/admin/layouts/          ← AdminLayout.jsx + .css
src/admin/components/Navigation/
src/admin/shared/           ← PageHeader, EmptyState, LoadingState, ModalShell, admin-ui.css
src/admin/components/developerComponents/AdminDashboard.*
src/routes/adminRoutes.jsx  ← uses AdminLayout shell

src/components/organizations/  ← restyled pages + modals (same exports)
src/components/employees/
src/components/shifts/
```

## Routes (unchanged paths)

- `/admin` → AdminDashboard  
- `/admin/organizations` (+ `:id`)  
- `/admin/employees`  
- `/admin/shifts`  
- `/admin/developer`  
- `/admin/apihealth`  
- Legacy: `/admin/org/all`, `/admin/org/all/:id`

## Shared UI

Import from `admin/shared` where useful:

```js
import "../admin/shared/admin-ui.css";
import PageHeader from "../admin/shared/PageHeader";
import EmptyState from "../admin/shared/EmptyState";
import LoadingState from "../admin/shared/LoadingState";
import ModalShell from "../admin/shared/ModalShell";
```

## Notes

- API endpoints and page logic preserved.
- Org detail links prefer `/admin/organizations/:id` (legacy routes still work).
- Practice Plannr routes under `publicRoutes` are separate and untouched.
EOF
