pragma solidity ^0.4.25;


contract company
{
    uint public decimals = 0;
    string public symbol;
    string public name;
    uint256 public totalSupply;
    mapping (address => uint) public balanceOf;
    mapping (bytes32 => string) public data;   

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(uint256 p0, string p1, string p2) public { 
        setData(p0, p1,p2);
    }
    
    function setData(uint256 initialSupply, string companyName, string shareName) public 
    {
        totalSupply = initialSupply ;  
        balanceOf[msg.sender] = initialSupply;            
        data["companyName"] = companyName;
        data["shareName"] = shareName;
        name = companyName;
        symbol = shareName;
    }

    function transfer(uint256 _value, address customer) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);   
        balanceOf[msg.sender] -= _value;    
        balanceOf[customer] += _value;       
        totalSupply -= _value;
        Transfer(msg.sender, customer, _value);                 
        return true;
    }

    function balanceOf(address _owner) constant returns (uint256) 
    {
      return balanceOf[_owner];
    }

    function totalSupply() constant returns (uint256 supply) 
    {
        return totalSupply;
    }
	
	function getExecutionid() constant returns (string)
    {
        return data["Executionid"];
    }
}

