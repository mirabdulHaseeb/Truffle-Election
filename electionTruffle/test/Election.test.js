const { assert } = require("chai");
const Election = artifacts.require("Election");
const truffleAssert = require('truffle-assertions');

describe("Election Contract", ()=> {
    let election;
    let accounts;
    let ownerAddress;
    let validCandidate;
    let invalidCandidate;
    let validVoter;
    let invalidVoter;

    before(async ()=> {
        election = await Election.new("Anual Elections");
        accounts = await web3.eth.getAccounts();
        ownerAddress = accounts[0];
        validCandidate = accounts[1];
        invalidCandidate = accounts[2];
        validVoter = accounts[3];
        invalidVoter = accounts[4];
    });

    describe("Deployment", ()=> {
        it("should deploy the contract with the right name", async ()=> {
            console.log("\nContract Address", election.address);
            assert.equal(await election.electionName(), "Anual Elections");
        });
        it("should make sure that the deployer is the owner", async ()=> {
            assert.equal(await election.owner(), ownerAddress);
        });
        it("should set the state to Created", async ()=> {
            assert.equal(await election.state(), 0);
        });
    });

    describe("Candidate Registration", ()=> {
        it("should verify that the candidate has paid 1 ether", async ()=> {
            await election.registerCandidate({from: validCandidate, value: web3.utils.toWei("1", "ether")});
            const balance = await web3.eth.getBalance(election.address);
            assert.equal(balance, web3.utils.toWei("1", "ether"));
        });
        it("should not allow registration without the fee", async ()=> {
            await truffleAssert.reverts(election.registerCandidate({value: web3.utils.toWei("0", "ether")}), "Pay one ether to register");
        });
        it("should register the candidate", async ()=> {
            await election.registerCandidate({value: web3.utils.toWei("1", "ether")});
            const candidates = await election.candidates(validCandidate);
            assert.equal(candidates["registered"], true);
        });
    });

    describe("VoterRegistration", ()=> {
        it("should register a voter", async ()=> {
            await election.registerVoter(validVoter);
            const voters = await election.voters(validVoter); 
            assert.equal(voters["registered"], true);
        });
        it("should make sure that the voter is not already registered", async ()=> {
            await truffleAssert.reverts(election.registerVoter(validVoter), "Voter is already registered");
        });
        it("should not allow the owner to be registered", async ()=> {
            await truffleAssert.reverts(election.registerVoter(ownerAddress), "Owner cannot be registered");
        });
    });

    describe("Add Candidate", ()=> {
        it("should make sure that only a registered candidate gets added", async ()=> {
            assert.isOk(await election.addCandidate(validCandidate, "New Candidate"));
        });
        it("should make sure that a non registered candidate doesn't get added", async ()=> {
            await truffleAssert.reverts(election.addCandidate(invalidCandidate, "Non-registered candidate"), "Candidate is not registered");
        });
        it("should have the state Created", async ()=> {
            assert.equal(await election.state(), 0);
        });
        it("should have the correct name and zero voteCount", async ()=> {
            const candidates = await election.candidates(validCandidate);
            assert.equal(candidates["name"], "New Candidate");
            assert.equal(candidates["voteCount"], 0);
        });
        it("should append candidate address", async ()=> {
            assert.equal(await election.getTotalCandidates(), 1)
        });
    });

    describe("Start Voting", ()=> {
        it("should update the state to Voting", async ()=> {
            await election.startVote();
            assert.equal(await election.state(), 1);
        });
    });

    describe("Vote", () => {
        it("should make sure that the state is set to Voting", async ()=> {
            assert.equal(await election.state(), 1);
        });
        it("should make sure that the voter hasn't already voted", async ()=> {
            const voters = await election.voters(validVoter);
            assert.equal(await voters["voted"], false);
        });
        it("should only allow a registered voter", async ()=> {
            await truffleAssert.reverts(election.vote(ownerAddress), "Voter is not registered");
        });
        it("should not allow a non-registered voter to vote", async ()=> {
            await truffleAssert.reverts(election.vote(invalidVoter), "Voter is not registered");
        });
        it("should make sure that the voter has voted and that the vote went to the correct address", async ()=> {
            await election.vote(validCandidate, {from: validVoter}); // voterAddress voted for validCandidate
            const voters = await election.voters(validVoter); 
            assert.equal(await voters["vote"], validCandidate); // confirm that the vote went to validCandidate
            assert.equal(await voters["voted"], true);
        });
        it("should increment the candidate's vote count", async ()=> {
            const candidates = await election.candidates(validCandidate);
            assert.equal(candidates["voteCount"], 1);
        }); 
        it("should increment the total vote count", async ()=> {
            assert.equal(await election.totalVotes(), 1);
        });
    });

    describe("End Voting", ()=> {
        it("should update the state to Ended", async ()=> {
            await election.endVote();
            assert.equal(await election.state(), 2);
        });
    });

    describe("Withdraw Registration Funds", ()=> {
        it("should verify that there are funds in the contract", async ()=> {
            assert.isOk(await election.withdrawRegistrationFunds());
        });
    });

    describe("Announce Winner", ()=> {
        it("should only announce the winner if the voting has ended", async ()=> {
            await election.announceWinner();
            assert.equal(await election.state(), 2);
        });
    });
});