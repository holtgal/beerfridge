import React, { Component } from 'react'
import styled from 'styled-components'
import { Router, Route, Switch } from 'react-router-dom'
import history from './History'
import axios from 'axios'
import { media } from './style-utils'

import Transitions from './transitions'
import Nav from './components/Nav'
import AllBeers from './components/AllBeers'
import AddBeers from './components/AddBeers'
import Cooler from './components/Cooler'
import { slide } from './transitions'

import Cap from './images/bottle-cap.png';
import BackgroundAdd from './images/background-add.png'
import BackgroundMain from './images/background-main.jpg'
import BackgroundCooler from './images/background-cooler.png'
import Plus from './images/plus.png'
import Open from './images/cooler-open.png'
import Pint from './images/pint.png'
import Like from './images/like.png'
import Menu from './images/menu.png'
import Cancel from './images/cancel.png'

import NotFound from './components/NotFound'


const Wrapper = styled.main`
  display: grid;
  grid-template-columns: 10px auto;
  max-height: 100vh;
  overflow: hidden;
  perspective: 1500px;
  ${media.tablet`grid-template-columns: auto;`}
`

const Hamburger = styled.div`
  display: none;
  height: 60px;
  width: 150px;
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 5;
  ${media.tablet`
    display: grid;
    justify-items: center;
    align-items: center;`}
`

const MenuIcon = styled.img`
  width: 100%;
  display: ${props => props.fold ? 'block' : 'none'};
`

const CancelIcon = styled.img`
  width: 100%;
  display: ${props => props.fold ? 'none' : 'block'};
`

class App extends Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.updateLikes = this.updateLikes.bind(this)
    this.deleteBeer = this.deleteBeer.bind(this)
    this.toggleActiveClass = this.toggleActiveClass.bind(this)
    this.foldNav = this.foldNav.bind(this)

    this.state = {
      url: "v1/beer/",
      active: 0,
      beers: [],
      backgroundMain: BackgroundMain,
      backgroundAdd: BackgroundAdd,
      backgroundCooler: BackgroundCooler,
      cap: Cap,
      plus: Plus,
      open: Open,
      pint: Pint,
      like: Like,
      fold: true,
      menu: Menu,
      cancel: Cancel
    }
  }
  loadData() {
    axios.get(this.state.url)
      .then(res => {
        const beers = res.data
        this.setState({ beers })
      })
  }
  
  componentDidMount() {
    this.loadData()
  }

  toggleActiveClass(i) {
    const active = i
    this.setState({ active })
  }

  handleSubmit(event) {
    event.preventDefault()
    const form = event.target,
    name = form.name.value
    if (!name) {
      alert("Must enter beer name!")
    } else {  
      const newBeer = {
        name: name,
        likes: 1
      }
      axios.post(this.state.url, newBeer, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        this.loadData()
        alert(`Hey Blazer lets crush a brewski!`)
        this.toggleActiveClass(1)
        history.push({ pathname: '/beers', state: slide })
      }).catch((error) => {
        alert("UH OH! Looks like we're having issues with our server please try again later")
        console.log(error)
   
        }
      )
      form.reset()   
    }
  }

  updateLikes(i, beer) {
    const beers = {...this.state.beers}
    beers[i] = beer
    this.setState({ beers })
    const likes = {
      likes: beer.likes
    }
    axios.put(`${this.state.url}${beer.id}`, likes)
      .then(res => {
        this.loadData()
      }).catch((error) => {
        console.log(error)

        }
      )  
  }
  
  deleteBeer(beer) {
    axios.delete(`${this.state.url}${beer.id}`)
      .then(res => {
        this.loadData()
      }).catch((error) => {
        alert("UH OH! Looks like we're having issues with our server please try again later")
        console.log(error)

        }
      )  
  }

  foldNav() {
    this.setState({ fold: !this.state.fold })
  }

  render(){
    const { 
      active, 
      backgroundAdd, 
      backgroundCooler, 
      backgroundMain, 
      beers, 
      cap, 
      cancel, 
      fold, 
      like, 
      menu, 
      open, 
      pint, 
      plus 
    } = this.state
    return ( 
      <Router history={history}>
        <Wrapper fold={() => this.foldNav()}>
          <Hamburger onClick={this.foldNav}>
            <MenuIcon src={menu} alt="menu open" fold={fold}/>
            <CancelIcon src={cancel} alt="menu close" fold={fold}/>
          </Hamburger>
          <Nav active={active} cap={cap} fold={fold} plus={plus} toggle={this.toggleActiveClass}/>
          <Route render={({ location }) => (
            <Transitions pageKey={location.key} {...location.state}> 
              <Switch location={location}>
                <Route exact path="/" render={props => <Cooler active={active} background={backgroundCooler} open={open} toggle={this.toggleActiveClass}/>}/>
                <Route exact path="/beers" render={props => <AllBeers background={backgroundMain} beers={beers} deleteBeer={this.deleteBeer} like={like} pint={pint} plus={plus} toggle={this.toggleActiveClass} updateLikes={this.updateLikes}/>}/>
                <Route path="/add" render={props => <AddBeers background={backgroundAdd} handleSubmit={this.handleSubmit} plus={plus} />}/>
                <Route render={props => <NotFound toggle={this.toggleActiveClass}/>}/>
              </Switch>
            </Transitions>
          )}/>
        </Wrapper>
      </Router>
    )
  }
}

export default App
