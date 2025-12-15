<template>
  <div class="admin-certificates">
    <div class="section-header">
      <h2>📜 مدیریت گواهینامه‌ها و استانداردها</h2>
      <button @click="openAddDialog" class="btn-add">
        ➕ افزودن گواهینامه
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>بارگذاری اطلاعات...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="certificates.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <p>هنوز گواهینامه‌ای ثبت نشده است.</p>
      <button @click="openAddDialog" class="btn-add-empty">افزودن گواهینامه اول</button>
    </div>

    <!-- Certificates Grid -->
    <div v-else class="certificates-grid">
      <div v-for="cert in certificates" :key="cert.id" class="certificate-card">
        <div class="cert-header">
          <div class="cert-icon" :style="{ backgroundColor: cert.color || '#667eea' }">
            {{ cert.icon }}
          </div>
          <div class="cert-actions">
            <button @click="editCertificate(cert)" class="btn-icon" title="ویرایش">
              ✏️
            </button>
            <button @click="deleteCertificate(cert.id)" class="btn-icon danger" title="حذف">
              🗑️
            </button>
          </div>
        </div>
        
        <div class="cert-content">
          <h3 class="cert-title">{{ cert.title }}</h3>
          <p class="cert-issuer">{{ cert.issuer }}</p>
          
          <div class="cert-meta">
            <span v-if="cert.date" class="cert-date">📅 {{ cert.date }}</span>
            <span v-if="cert.type_label" class="cert-badge" :class="cert.type">
              {{ cert.type_label }}
            </span>
          </div>
          
          <p v-if="cert.description" class="cert-description">
            {{ cert.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDialog" class="modal-overlay" @click="closeDialog">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>{{ editingId ? 'ویرایش گواهینامه' : 'افزودن گواهینامه جدید' }}</h3>
              <button @click="closeDialog" class="btn-close">✕</button>
            </div>

            <form @submit.prevent="saveCertificate" class="certificate-form">
              <div class="form-group">
                <label for="cert-title">نام گواهینامه *</label>
                <input
                  id="cert-title"
                  v-model="formData.title"
                  type="text"
                  placeholder="مثلاً: گواهینامه تخصصی Vue.js"
                  required
                />
              </div>

              <div class="form-group">
                <label for="cert-issuer">سازمان صادر‌کننده *</label>
                <input
                  id="cert-issuer"
                  v-model="formData.issuer"
                  type="text"
                  placeholder="مثلاً: Vue School"
                  required
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="cert-date">تاریخ</label>
                  <input
                    id="cert-date"
                    v-model="formData.date"
                    type="text"
                    placeholder="مثلاً: ۲۰۲۴"
                  />
                </div>

                <div class="form-group">
                  <label for="cert-icon">آیکون</label>
                  <input
                    id="cert-icon"
                    v-model="formData.icon"
                    type="text"
                    placeholder="مثلاً: ⚡"
                    maxlength="2"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="cert-color">رنگ</label>
                  <input
                    id="cert-color"
                    v-model="formData.color"
                    type="color"
                    title="انتخاب رنگ"
                  />
                </div>

                <div class="form-group">
                  <label for="cert-type">نوع</label>
                  <select id="cert-type" v-model="formData.type">
                    <option value="">بدون نوع</option>
                    <option value="certificate">گواهینامه</option>
                    <option value="standard">استاندارد</option>
                    <option value="qualification">مدرک</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="cert-gradient">Gradient</label>
                <input
                  id="cert-gradient"
                  v-model="formData.gradient"
                  type="text"
                  placeholder="مثلاً: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
              </div>

              <div class="form-group">
                <label for="cert-image">تصویر شاخص</label>
                <div class="image-upload-group">
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    :disabled="uploading"
                    class="file-input"
                  />
                  <div v-if="uploading" class="upload-status">در حال آپلود...</div>
                  <div v-if="formData.image" class="image-preview">
                    <img :src="formData.image" alt="پیش‌نمایش" />
                    <button type="button" @click="formData.image = ''" class="btn-remove-image">×</button>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="cert-slider">اسلایدر</label>
                <select id="cert-slider" v-model.number="formData.slider_id">
                  <option :value="null">بدون اسلایدر</option>
                  <option v-for="slider in sliders" :key="slider.id" :value="slider.id">
                    {{ slider.name }} ({{ slider.images?.length || 0 }} تصویر)
                  </option>
                </select>
                <small class="form-hint">برای نمایش چندین تصویر به صورت اسلایدر</small>
              </div>

              <div class="form-group">
                <label for="cert-type-label">برچسب نوع (متن)</label>
                <input
                  id="cert-type-label"
                  v-model="formData.type_label"
                  type="text"
                  placeholder="مثلاً: معتبر"
                />
              </div>

              <div class="form-group">
                <label for="cert-description">توضیح</label>
                <textarea
                  id="cert-description"
                  v-model="formData.description"
                  placeholder="توضیح کوتاهی درباره این گواهینامه..."
                  rows="4"
                ></textarea>
              </div>

              <div class="form-actions">
                <button type="button" @click="closeDialog" class="btn-cancel">
                  انصراف
                </button>
                <button type="submit" class="btn-submit">
                  {{ editingId ? 'بروزرسانی' : 'افزودن' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirmation Dialog -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showConfirm" class="modal-overlay" @click="showConfirm = false">
          <div class="confirm-dialog" @click.stop>
            <p>آیا از حذف این گواهینامه اطمینان دارید؟</p>
            <div class="confirm-actions">
              <button @click="showConfirm = false" class="btn-cancel">انصراف</button>
              <button @click="confirmDelete" class="btn-delete">حذف</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminService } from '../api/services'

const certificates = ref([])
const sliders = ref([])
const loading = ref(true)
const uploading = ref(false)
const showDialog = ref(false)
const showConfirm = ref(false)
const editingId = ref(null)
const deleteTargetId = ref(null)

const formData = ref({
  title: '',
  issuer: '',
  date: '',
  description: '',
  icon: '📜',
  color: '#667eea',
  gradient: '',
  image: '',
  slider_id: null,
  type: '',
  type_label: ''
})

const resetForm = () => {
  formData.value = {
    title: '',
    issuer: '',
    date: '',
    description: '',
    icon: '📜',
    color: '#667eea',
    gradient: '',
    image: '',
    slider_id: null,
    type: '',
    type_label: ''
  }
}

const openAddDialog = () => {
  editingId.value = null
  resetForm()
  showDialog.value = true
}

const editCertificate = (cert) => {
  editingId.value = cert.id
  formData.value = {
    title: cert.title,
    issuer: cert.issuer,
    date: cert.date || '',
    description: cert.description || '',
    icon: cert.icon || '📜',
    color: cert.color || '#667eea',
    gradient: cert.gradient || '',
    image: cert.image || '',
    slider_id: cert.slider_id || null,
    type: cert.type || '',
    type_label: cert.type_label || ''
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingId.value = null
  resetForm()
}

const saveCertificate = async () => {
  try {
    if (editingId.value) {
      await adminService.updateCertificate(editingId.value, formData.value)
    } else {
      await adminService.createCertificate(formData.value)
    }
    
    await fetchCertificates()
    closeDialog()
  } catch (error) {
    console.error('خطا در ذخیره گواهینامه:', error)
    alert('خطا در ذخیره گواهینامه. لطفاً دوباره سعی کنید.')
  }
}

const deleteCertificate = (id) => {
  deleteTargetId.value = id
  showConfirm.value = true
}

const confirmDelete = async () => {
  try {
    await adminService.deleteCertificate(deleteTargetId.value)
    await fetchCertificates()
    showConfirm.value = false
    deleteTargetId.value = null
  } catch (error) {
    console.error('خطا در حذف گواهینامه:', error)
    alert('خطا در حذف گواهینامه. لطفاً دوباره سعی کنید.')
  }
}

const fetchCertificates = async () => {
  try {
    loading.value = true
    const response = await adminService.getCertificates()
    certificates.value = Array.isArray(response) ? response : response.data || []
  } catch (error) {
    console.error('خطا در دریافت گواهینامه‌ها:', error)
    certificates.value = []
  } finally {
    loading.value = false
  }
}

const fetchSliders = async () => {
  try {
    const response = await adminService.getSliders()
    sliders.value = Array.isArray(response) ? response : response.data || []
  } catch (error) {
    console.error('خطا در دریافت اسلایدرها:', error)
    sliders.value = []
  }
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    uploading.value = true
    const uploadedUrl = await adminService.uploadImage(file)
    formData.value.image = uploadedUrl
  } catch (error) {
    console.error('خطا در آپلود تصویر:', error)
    alert('خطا در آپلود تصویر. لطفاً دوباره سعی کنید.')
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  fetchCertificates()
  fetchSliders()
})
</script>

<style scoped>
.admin-certificates {
  padding: 2rem;
  max-width: 1400px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #333;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.btn-add-empty {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-add-empty:hover {
  background: #764ba2;
}

.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.certificate-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.certificate-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.cert-icon {
  width: 50px;
  height: 50px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.cert-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: #f0f0f0;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #e0e0e0;
}

.btn-icon.danger:hover {
  background: #ffebee;
  color: #c62828;
}

.cert-content {
  flex: 1;
}

.cert-title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #333;
}

.cert-issuer {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.cert-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
}

.cert-date {
  color: #999;
}

.cert-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.cert-badge.standard {
  background: #fff3e0;
  color: #f57c00;
}

.cert-badge.certificate {
  background: #e8f5e9;
  color: #388e3c;
}

.cert-badge.qualification {
  background: #fce4ec;
  color: #c2185b;
}

.cert-description {
  margin: 0.75rem 0 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #333;
}

.certificate-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.4rem;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #666;
}

.image-upload-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-input {
  padding: 0.5rem;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-input:hover:not(:disabled) {
  border-color: #667eea;
  background: #f8f9ff;
}

.file-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-status {
  padding: 0.5rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 8px;
  text-align: center;
  font-size: 0.875rem;
}

.image-preview {
  position: relative;
  width: fit-content;
}

.image-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #ddd;
}

.btn-remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f44336;
  color: white;
  border: 2px solid white;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.btn-remove-image:hover {
  background: #d32f2f;
  transform: scale(1.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.4rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f0f0f0;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.confirm-dialog {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.confirm-dialog p {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.1rem;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
}

.btn-delete {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: #c62828;
  color: white;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-delete:hover {
  background: #b71c1c;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-enter-active .confirm-dialog {
  animation: slideIn 0.3s ease;
}

.modal-leave-active .modal-content,
.modal-leave-active .confirm-dialog {
  animation: slideOut 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.95);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .certificates-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add {
    width: 100%;
    text-align: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
