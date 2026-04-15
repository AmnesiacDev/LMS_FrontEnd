import React from 'react';

const About = () => {
  return (
    <div style={{ padding: '5rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '2rem', textAlign: 'center' }}>About The Creator</h1>
      
      {/* Profile Section */}
      <div className="glass-panel" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Youssef Emad Hussin</h2>
           <h3 style={{ color: 'var(--brand-primary)', fontWeight: '600' }}>Full-Stack Web Developer & Instructor</h3>
           <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7' }}>
             I am a Full-Stack Developer with experience in building secure, scalable, and responsive web applications using modern back-end and front-end technologies. Skilled in designing RESTful APIs, working with databases, and creating clean, maintainable code. I also have deep experience in technical instruction, problem-solving, and collaborative development.
           </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
         {/* Experience Section */}
         <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Experience</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
               <h4 style={{ color: 'var(--info)' }}>English Coding Instructor</h4>
               <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>ISchool | August 2025</p>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Developed strong communication and presentation skills by explaining complex technical concepts. Improved ability to design structured learning paths, interactive coding activities, and problem-solving strategies.
               </p>
            </div>
            
            <div>
               <h4 style={{ color: 'var(--info)' }}>Full-Stack .NET Developer</h4>
               <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>DEPI Initiative | Jun 2025 - Dec 2025</p>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Building end-to-end web applications with ASP.NET, C#, SQL Server, and modern front-end frameworks focusing on clean architecture.
               </p>
            </div>
         </div>

         {/* Education & Internships */}
         <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Education & Diplomas</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
               <h4 style={{ color: 'var(--success)' }}>BSC. in Computer Science & AI</h4>
               <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Cairo University | 2024</p>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
               <h4 style={{ color: 'var(--success)' }}>MEAN Stack Web Development</h4>
               <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>NTI | Jul 2023 - Sep 2023</p>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Built full-stack applications with MongoDB, Express, Angular, and Node.js.</p>
            </div>

            <div>
               <h4 style={{ color: 'var(--success)' }}>YAT Full Stack Web Diploma</h4>
               <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>El Maadi | Mar 2018 - Jul 2018</p>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>PHP, Laravel, MySQL, and Front-end technologies.</p>
            </div>
         </div>
      </div>

      {/* Tech Skills */}
      <div className="glass-panel" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)' }}>
         <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Technical Arsenal</h3>
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {['HTML/CSS', 'JavaScript (ES6+)', 'TypeScript', 'Angular', 'React.js', 'Node.js', 'Express.js', 'C# / ASP.NET Core', 'SQL Server', 'MongoDB', 'Python', 'RESTful APIs', 'OOP & Design Patterns'].map(skill => (
               <span key={skill} style={{ padding: '0.5rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontWeight: '500', color: 'var(--brand-primary)', border: '1px solid var(--border-color)' }}>
                  {skill}
               </span>
            ))}
         </div>
      </div>
    </div>
  );
};

export default About;
