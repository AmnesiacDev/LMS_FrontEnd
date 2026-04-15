import React from 'react';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for reaching out! We will get back to you soon.');
  };

  return (
    <div style={{ padding: '5rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Let's Connect</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Have a question or want to work together? Reach out!</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '3rem', alignItems: 'start' }}>
         {/* Contact Information Side */}
         <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Contact Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div>
                 <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Name</h4>
                 <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>Youssef Emad Hussin</p>
               </div>
               
               <div>
                 <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</h4>
                 <a href="mailto:youssefemadhassan66@gmail.com" style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--info)' }}>youssefemadhassan66@gmail.com</a>
               </div>

               <div>
                 <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Phone</h4>
                 <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>0150 159 8998</p>
               </div>
               
               <div>
                 <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Location</h4>
                 <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>Giza, Egypt</p>
               </div>

               <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <a href="https://www.linkedin.com/in/youssef-emad-037570250" target="_blank" rel="noreferrer" style={{ padding: '0.5rem 1rem', background: 'var(--brand-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 'bold' }}>LinkedIn</a>
                  <a href="https://github.com/youssefemadhassan66" target="_blank" rel="noreferrer" style={{ padding: '0.5rem 1rem', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 'bold' }}>GitHub</a>
               </div>
            </div>
         </div>

         {/* Contact Form Side */}
         <div className="glass-panel" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Your Name</label>
              <input type="text" required style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} placeholder="Jane Doe" />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Email Address</label>
              <input type="email" required style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} placeholder="jane@example.com" />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Message</label>
              <textarea required rows="5" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }} placeholder="How can we collaborate?"></textarea>
            </div>
            
            <button type="submit" style={{ background: 'var(--brand-primary)', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', fontWeight: '600', fontSize: '1.1rem', marginTop: '1rem', cursor: 'pointer', border: 'none' }}>
              Send Message
            </button>
          </form>
         </div>
      </div>
    </div>
  );
};

export default Contact;
