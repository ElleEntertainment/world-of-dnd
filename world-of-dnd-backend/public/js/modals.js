// Minimal modal component for admin edit flows
// Usage:
//   const modal = new AdminModal();
//   modal.show({ title: 'Edit', body: '<input />', onConfirm: async () => { ... } });
(function () {
  class AdminModal {
    constructor() {
      this._create();
      this.onConfirm = null;
    }

    _create() {
      // overlay
      this.overlay = document.createElement('div');
      this.overlay.className = 'admin-modal-overlay fixed inset-0 bg-black/50 hidden z-50 flex items-center justify-center';
      // container
      this.dialog = document.createElement('div');
      this.dialog.className = 'admin-modal max-w-lg w-full bg-slate-800/90 border border-slate-700 rounded-lg p-4 text-slate-100 shadow-lg';
      this.overlay.appendChild(this.dialog);

      // header
      this.header = document.createElement('div');
      this.header.className = 'flex items-center justify-between mb-3';
      this.titleEl = document.createElement('div');
      this.titleEl.className = 'text-lg font-semibold';
      this.closeBtn = document.createElement('button');
      this.closeBtn.className = 'text-slate-300 hover:text-white';
      this.closeBtn.innerHTML = '✕';
      this.closeBtn.addEventListener('click', () => this.hide());
      this.header.appendChild(this.titleEl);
      this.header.appendChild(this.closeBtn);

      // body
      this.body = document.createElement('div');
      this.body.className = 'admin-modal-body mb-4';

      // footer
      this.footer = document.createElement('div');
      this.footer.className = 'flex justify-end gap-2';
      this.cancelBtn = document.createElement('button');
      this.cancelBtn.className = 'px-3 py-1 rounded bg-slate-700 hover:bg-slate-600';
      this.cancelBtn.textContent = 'Cancel';
      this.cancelBtn.addEventListener('click', () => this.hide());
      this.confirmBtn = document.createElement('button');
      this.confirmBtn.className = 'px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white';
      this.confirmBtn.textContent = 'Confirm';
      this.confirmBtn.addEventListener('click', async () => {
        if (typeof this.onConfirm === 'function') {
          try {
            await this.onConfirm();
            this.hide();
          } catch (e) {
            // swallow, caller should handle errors inside onConfirm
            console.error(e);
          }
        } else {
          this.hide();
        }
      });

      this.footer.appendChild(this.cancelBtn);
      this.footer.appendChild(this.confirmBtn);

      // assemble
      this.dialog.appendChild(this.header);
      this.dialog.appendChild(this.body);
      this.dialog.appendChild(this.footer);

      document.body && document.body.appendChild(this.overlay);
    }

    show({ title = '', body = '', confirmText = 'Confirm', cancelText = 'Cancel', onConfirm = null } = {}) {
      this.titleEl.textContent = title;
      if (typeof body === 'string') {
        this.body.innerHTML = body;
      } else if (body instanceof Node) {
        this.body.innerHTML = '';
        this.body.appendChild(body);
      } else {
        this.body.innerHTML = String(body);
      }
      this.confirmBtn.textContent = confirmText;
      this.cancelBtn.textContent = cancelText;
      this.onConfirm = onConfirm;
      this.overlay.classList.remove('hidden');
    }

    hide() {
      this.overlay.classList.add('hidden');
    }

    setLoading(isLoading) {
      if (isLoading) {
        this.confirmBtn.setAttribute('disabled', 'disabled');
        this.confirmBtn.classList.add('opacity-70');
      } else {
        this.confirmBtn.removeAttribute('disabled');
        this.confirmBtn.classList.remove('opacity-70');
      }
    }
  }

  // Helper: wire edit buttons (data-edit-target, data-edit-fields, data-edit-url)
  function initEditModals(selector = '[data-edit-target],[data-edit-fields],[data-edit-url]') {
    const modal = new AdminModal();
    document.addEventListener('click', (ev) => {
      const btn = ev.target.closest(selector);
      if (!btn) return;
      ev.preventDefault();

      const title = btn.getAttribute('data-edit-title') || 'Edit';
      const confirmText = btn.getAttribute('data-confirm-text') || 'Save';
      const cancelText = btn.getAttribute('data-cancel-text') || 'Cancel';

      // Build form body from data-edit-fields (JSON) or data-edit-target (selector)
      let fields = null;
      if (btn.dataset.editFields) {
        try {
          fields = JSON.parse(btn.dataset.editFields);
        } catch (e) {
          fields = null;
        }
      }

      // If no fields provided, try to extract from a selector
      let bodyHtml = '';
      if (!fields && btn.dataset.editTarget) {
        try {
          const el = document.querySelector(btn.dataset.editTarget);
          if (el) bodyHtml = `<div class="mb-2">${el.innerHTML}</div>`;
        } catch (e) {}
      }

      // If fields provided, render inputs
      if (fields && Array.isArray(fields)) {
        bodyHtml += '<div class="space-y-3">';
        for (const f of fields) {
          const name = f.name || f.key || 'field';
          const label = f.label || name;
          const type = (f.type || 'text').toLowerCase();
          const value = f.value != null ? String(f.value) : '';
          if (type === 'textarea') {
            bodyHtml += `<div><label class="block text-sm text-slate-300 mb-1">${escapeHtml(label)}</label><textarea data-field-name="${escapeHtml(name)}" class="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder:text-slate-500">${escapeHtml(value)}</textarea></div>`;
          } else {
            bodyHtml += `<div><label class="block text-sm text-slate-300 mb-1">${escapeHtml(label)}</label><input data-field-name="${escapeHtml(name)}" type="${escapeHtml(type)}" value="${escapeHtml(value)}" class="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder:text-slate-500" /></div>`;
          }
        }
        bodyHtml += '</div>';
      } else {
        // fallback single input
        bodyHtml += '<div><label class="block text-sm text-slate-300">Value</label><input id="admin-edit-input" class="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2 text-slate-100" /></div>';
      }

      modal.show({
        title,
        body: bodyHtml,
        confirmText,
        cancelText,
        onConfirm: async () => {
          // collect field values
          let payload = {};
          if (fields && Array.isArray(fields)) {
            for (const f of fields) {
              const name = f.name || f.key || 'field';
              const el = modal.body.querySelector(`[data-field-name="${name}"]`);
              if (!el) { payload[name] = null; continue; }
              if (el.tagName.toLowerCase() === 'textarea' || el.type === 'text' || el.type === 'number' || el.type === 'password' || el.type === 'email') {
                payload[name] = el.value;
              } else if (el.type === 'checkbox') {
                payload[name] = el.checked;
              } else {
                payload[name] = el.value;
              }
            }
          } else {
            const single = document.getElementById('admin-edit-input');
            payload = { value: single ? single.value : null };
          }

          const url = btn.dataset.editUrl || btn.getAttribute('data-edit-url') || null;
          const method = (btn.dataset.editMethod || btn.getAttribute('data-edit-method') || 'PUT').toUpperCase();

          // If a URL is provided, perform the request; else emit event for custom handling
          if (url) {
            try {
              const headers = { 'Content-Type': 'application/json' };
              // include bearer token fallback from localStorage if present
              const t = (typeof localStorage !== 'undefined') ? localStorage.getItem('access_token') : null;
              if (t) headers['Authorization'] = 'Bearer ' + t;

              const res = await fetch(url, {
                method,
                credentials: 'include',
                headers,
                body: JSON.stringify(payload)
              });

              let json = null;
              try { json = await res.json(); } catch (e) { json = null; }

              const event = new CustomEvent('admin:modal:save', { detail: { url, method, status: res.status, ok: res.ok, response: json, source: btn } });
              document.dispatchEvent(event);
            } catch (e) {
              const event = new CustomEvent('admin:modal:save', { detail: { url, method, status: 0, ok: false, error: String(e), source: btn } });
              document.dispatchEvent(event);
            }
          } else {
            const event = new CustomEvent('admin:modal:save', { detail: { payload, source: btn } });
            document.dispatchEvent(event);
          }
        }
      });
    });
    return modal;
  }

  // small helper for escaping HTML inside template strings used above
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, s => ({'&':'&','<':'<','>':'>','"':'"',"'":"&#39;"}[s]));
  }

  // Export to global
  window.AdminModal = AdminModal;
  window.initAdminEditModals = initEditModals;

  // Diagnostics: help debug missing modal initialization
  try {
    if (typeof console !== 'undefined' && console.info) {
      console.info('[modals.js] loaded, initAdminEditModals available:', !!window.initAdminEditModals);
    }
  } catch (e) {}
})();
