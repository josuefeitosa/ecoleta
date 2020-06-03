import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import logo from '../../assets/logo.svg';

interface HeaderProps {
  link: string | null;
}

const Header: React.FC<HeaderProps> = ({ link }: HeaderProps) => (
  <header>
    <img src={logo} alt="Ecoleta" />
    {link && (
      <Link to={link}>
        <FiArrowLeft />
        Voltar para home
      </Link>
    )}
  </header>
);

export default Header;
