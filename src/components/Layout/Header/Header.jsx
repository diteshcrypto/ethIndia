// External libraries
import React, { Component } from "react";
import { Navbar, Nav, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

// Styling
import "./Header.css";

class Header extends Component {
    render() {
        return (
            <Navbar>
                <Navbar.Header>
                    <Navbar.Brand><div style={{ color: 'black' }}>Ethunders</div></Navbar.Brand>
                </Navbar.Header>

                <Nav>
                    <LinkContainer to="/campaing" exact={true}>
                        <NavItem>Creat Campaign</NavItem>
                    </LinkContainer>
                    <LinkContainer to="/" exact={true}>
                        <NavItem>Fund Projects</NavItem>
                    </LinkContainer>
                    <LinkContainer to="/lend">
                        <NavItem>Lend</NavItem>
                    </LinkContainer>

                    <LinkContainer to="/create">
                        <NavItem>Collatralize</NavItem>
                    </LinkContainer>

                    <LinkContainer to="/tokens">
                        <NavItem>Tokens</NavItem>
                    </LinkContainer>

                    <LinkContainer to="/investments">
                        <NavItem>Investments</NavItem>
                    </LinkContainer>
                </Nav>
            </Navbar>
        );
    }
}

export default Header;
