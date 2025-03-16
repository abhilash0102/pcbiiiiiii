import React from 'react';
import './AboutPage.css'; // Assuming you want to add some custom styles

const About = () => {
  return (
    <div className="about-page">
      <header className="about-header">
        <h1>About Our PC Build Service</h1>
      </header>
      
      <section className="about-content">
        <p>
          Welcome to the ultimate destination for custom PC builds! Whether you're a hardcore gamer, a content creator, or a professional in need of a powerful workstation, we are here to help you create the perfect PC tailored to your needs.
        </p>

        <h2>What We Do</h2>
        <p>
          Our goal is to provide high-quality custom PC builds for a variety of needs, from gaming and video editing to business and general use. We offer:
        </p>
        <ul>
          <li>Expert advice on selecting the best components for your budget and requirements</li>
          <li>Custom PC building and assembly</li>
          <li>Comprehensive testing to ensure optimal performance</li>
          <li>Ongoing support and upgrades to keep your system running at its best</li>
        </ul>

        <h2>Why Choose Us?</h2>
        <p>
          Our team consists of experienced professionals who are passionate about technology and performance. We understand the needs of every user and provide personalized guidance to make sure your PC build is exactly what you want.
        </p>
        <ul>
          <li>Personalized recommendations based on your needs</li>
          <li>Attention to detail in every build</li>
          <li>Fast, reliable, and efficient service</li>
          <li>High-quality, branded components that are built to last</li>
        </ul>

        <h2>Get Started</h2>
        <p>
          Ready to build your dream PC? <a href="/contact">Contact us</a> today for a free consultation and let us help you bring your vision to life!
        </p>
      </section>
      
      <footer className="about-footer">
        <p>&copy; 2024 Custom PC Builds. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default About;
