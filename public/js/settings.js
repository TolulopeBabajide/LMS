// settings.js

document.addEventListener('DOMContentLoaded', () => {
  fetchProfile();
  document.getElementById('editProfileBtn').addEventListener('click', showEditProfileModal);
  document.getElementById('deleteAccountBtn').addEventListener('click', showDeleteAccountModal);
});

async function fetchProfile() {
  try {
    const res = await fetch('/user/profile');
    const user = await res.json();
    if (user.error) throw new Error(user.error);
    
    // Update profile information
    document.getElementById('profileName').textContent = `${user.first_name} ${user.last_name}`;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileUsername').textContent = user.username;
    document.getElementById('profileNameCell').textContent = `${user.first_name} ${user.last_name}`;
    document.getElementById('profileEmailCell').textContent = user.email;
    document.getElementById('profileUsernameCell').textContent = user.username;
    document.getElementById('profileMemberSince').textContent = user.created_at ? new Date(user.created_at).toLocaleDateString() : '';
    document.getElementById('profileLastUpdated').textContent = user.updated_at ? new Date(user.updated_at).toLocaleDateString() : '';
    // Update profile picture if exists
    const profilePicture = document.getElementById('profile-picture');
    if (user.profile_picture) {
      profilePicture.src = user.profile_picture;
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function showEditProfileModal() {
  createEditProfileModal();
  document.getElementById('editProfileModal').classList.remove('hidden');
}

function closeEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  if (modal) {
    modal.classList.add('hidden');
    setTimeout(() => modal.remove(), 300);
  }
}

function createEditProfileModal() {
  if (document.getElementById('editProfileModal')) return;
  const modal = document.createElement('div');
  modal.id = 'editProfileModal';
  modal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
      <h2 class="text-xl font-semibold mb-4">Edit Profile</h2>
      <form id="editProfileForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium">Name</label>
          <input id="editName" name="name" type="text" class="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium">Email</label>
          <input id="editEmail" name="email" type="email" class="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium">Profile Picture</label>
          <input id="profilePicture" name="profile_picture" type="file" accept="image/*" class="w-full border rounded px-3 py-2" />
          <p class="text-sm text-gray-500 mt-1">Max file size: 5MB. Supported formats: JPG, PNG</p>
        </div>
        <div>
          <button type="button" id="showPasswordForm" class="text-blue-600 hover:underline text-sm">Change Password</button>
        </div>
        <div class="flex gap-4 mt-6">
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
          <button type="button" onclick="closeEditProfileModal()" class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
        </div>
      </form>
      <form id="passwordForm" class="space-y-4 mt-4 hidden">
        <div>
          <label class="block text-sm font-medium">Current Password</label>
          <input id="currentPassword" name="currentPassword" type="password" class="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium">New Password</label>
          <input id="newPassword" name="newPassword" type="password" class="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium">Confirm New Password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" class="w-full border rounded px-3 py-2" required />
        </div>
        <div class="flex gap-4 mt-6">
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Password</button>
          <button type="button" id="cancelPasswordForm" class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Pre-fill fields
  fetchProfile();
  
  // Form handlers
  document.getElementById('editProfileForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const [first_name, ...lastArr] = name.split(' ');
    const last_name = lastArr.join(' ');
    
    formData.append('first_name', first_name);
    formData.append('last_name', last_name);
    formData.append('email', email);
    
    const profilePicture = document.getElementById('profilePicture').files[0];
    if (profilePicture) {
      if (profilePicture.size > 5 * 1024 * 1024) {
        showToast('Profile picture must be less than 5MB', 'error');
        return;
      }
      formData.append('profile_picture', profilePicture);
    }
    
    try {
      const res = await fetch('/user/profile/update', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update profile');
      showToast('Profile updated successfully');
      closeEditProfileModal();
      fetchProfile();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  
  document.getElementById('showPasswordForm').onclick = () => {
    document.getElementById('passwordForm').classList.remove('hidden');
  };
  
  document.getElementById('cancelPasswordForm').onclick = () => {
    document.getElementById('passwordForm').classList.add('hidden');
  };
  
  document.getElementById('passwordForm').onsubmit = async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }
    
    try {
      const res = await fetch('/user/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update password');
      showToast('Password updated successfully');
      closeEditProfileModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
}

function showDeleteAccountModal() {
  if (document.getElementById('deleteAccountModal')) return;
  const modal = document.createElement('div');
  modal.id = 'deleteAccountModal';
  modal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
      <h2 class="text-xl font-semibold mb-4">Delete Account</h2>
      <p class="mb-6">Are you sure you want to delete your account? This action cannot be undone.</p>
      <div class="flex gap-4 justify-center">
        <button id="confirmDeleteAccount" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
        <button onclick="closeDeleteAccountModal()" class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  document.getElementById('confirmDeleteAccount').onclick = async () => {
    try {
      const res = await fetch('/user/profile', { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to delete account');
      showToast('Account deleted successfully');
      setTimeout(() => { window.location.href = '/login'; }, 1500);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
}

function closeDeleteAccountModal() {
  const modal = document.getElementById('deleteAccountModal');
  if (modal) {
    modal.classList.add('hidden');
    setTimeout(() => modal.remove(), 300);
  }
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white ${
    type === 'success' ? 'bg-green-600' : 'bg-red-600'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
} 