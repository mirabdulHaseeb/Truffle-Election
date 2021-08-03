import './App.css';
import web3 from './web3';
import React, { Component } from 'react';
import election from './election';

class App extends Component {

  state = {
    electionName: '',
    value: '',
    message: '', 
    balanceOf: 0,
    ownerBalance: 0,
    owner: '',
    newCanAddr: '',
    voterAddress: '',
    canToVote: '',
    newCanName: '',
    totalCans: '',
    totalVotes: 0
  }

  async componentDidMount() {
    const electionName = await election.methods.electionName().call();
    this.setState({ electionName });

    const balanceOf = await election.methods.balanceOf().call();
    const owner = await election.methods.owner().call();
    const totalCans = await election.methods.getTotalCandidates().call();
    const totalVotes = await election.methods.totalVotes().call();
    const ownerBalance = await election.methods.getOwnerBalance().call();
    const balanceInEth = web3.utils.fromWei(ownerBalance, 'ether');
    this.setState({ balanceOf, owner, totalCans, totalVotes, ownerBalance, balanceInEth });
    console.log("Contract balance", balanceOf);
    console.log("Owner", owner);
    console.log("Owner's Balance(What is this?????)", balanceInEth);
    console.log("Total Candidates", totalCans);
  }

  handleRegistration = async event => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    console.log(accounts[0])

    this.setState({ message: 'Waiting for transaction to complete...'});

    await election.methods.registerCandidate().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });
    this.setState({ message: 'Paid'});
  }

  handleAddCandidate = async event => {
    event.preventDefault();  
    const accounts = await web3.eth.getAccounts();
    await election.methods.addCandidate(this.state.newCanAddr, this.state.newCanName).send({from: accounts[0]})
    console.log("Candidate added "+this.state.newCanAddr);
    this.setState({ message: 'Candidate added: '+this.state.newCanAddr});
  }

  handleVoterRegistration = async event => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    await election.methods.registerVoter(this.state.voterAddress).send({from: accounts[0]})
    console.log("Voter Registered: "+this.state.voterAddress);
    this.setState({ message: "Voter Registered: "+ this.state.voterAddress});
  }

  handleStartVoting = async event => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    await election.methods.startVote().send({from: accounts[0]});
    console.log("Voting started");
    this.setState({ message: "Voting started" });
  }

  handleEndVoting = async event => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    await election.methods.endVote().send({from: accounts[0]});
    console.log("Voting ended");
    this.setState({ message: "Voting ended" });
  }

  handleCanToVote = async event => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    await election.methods.vote(this.state.canToVote).send({from: accounts[0]});
    console.log("Voted for: "+ this.state.canToVote);
    this.setState({ message: "Voted for : "+ this.state.canToVote });
  }

  handleAnnounceWinner = async event => {
    event.preventDefault();
    const winnerAddress = await election.methods.announceWinner().call()
    console.log("Winner: "+ winnerAddress);
    this.setState({ message: "Winner : "+ winnerAddress });
  }

  handleWithdrawRegistrationFunds = async event => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    await election.methods.withdrawRegistrationFunds().send({from: accounts[0]})
    console.log("Withdrawn");
    this.setState({ message: "Withdrawn" });
  }

  render() {
    return (
      <div className="container">
        <h3>{ this.state.electionName }</h3>
        <hr/>
          <form>
            <div>
              {/* <label>Register Candidate </label> */}
              <input value={this.state.value} 
                placeholder="Enter the amount"
                onChange={ event => this.setState({ value: event.target.value })}>
                
              </input>
            <button onClick={this.handleRegistration}>Register Candidate</button>
            </div>

            <br/>
            <div>
              <input size="35" value={this.state.newCanAddr}
                placeholder="Candidate address" 
                onChange={ event => this.setState({ newCanAddr: event.target.value })}>
              </input>
              {/* <input value={this.state.newCanName} 
                placeholder="Name"
                onChange={ event => this.setState({ newCanName: event.target.value })}>
              </input> */}
            <button onClick={this.handleAddCandidate}>Add Candidate</button>
            </div>

            <br/>
            <div>
              <input size="35" value={this.state.voterAddress}
                placeholder="Voter address" 
                onChange={ event => this.setState({ voterAddress: event.target.value })}>
              </input>
            <button onClick={this.handleVoterRegistration}>Register Voter</button>
            </div>
            <br/>

            <div>
            <button onClick={this.handleStartVoting}>Start Voting</button>
            </div>
            <br/>

            <div>
              <input size="35" value={this.state.canToVote}
                placeholder="Candidate address" 
                onChange={ event => this.setState({ canToVote: event.target.value })}>
              </input>
            <button onClick={this.handleCanToVote}>Vote</button>
            </div>
            <br/>

            <div>
            <button onClick={this.handleEndVoting}>End Voting</button>
            </div>
            <br/>

            <div>
            <button onClick={this.handleAnnounceWinner}>announceWinner</button>
            </div>
            <br/>

            <div>
            <button onClick={this.handleWithdrawRegistrationFunds}>withdraw Funds</button>
            </div>
            <br/>

          </form>

          <hr/>
          <h5>{this.state.message}</h5>
          <br/>
          <ul>
            <li>Owner: {this.state.owner}</li>
            {/* <li>Owner's Balance: {this.state.balanceInEth} </li> */}
            <li>Contract Balance: {this.state.balanceOf}</li>
            <li>Candidates: {this.state.totalCans}</li>
            <li>Total Votes: {this.state.totalVotes}</li>
          </ul>
      </div>
    );
  }
}

export default App;
