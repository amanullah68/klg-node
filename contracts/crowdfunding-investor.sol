pragma solidity ^0.4.25;


contract crowdfunding_investor
{
    uint public decimals = 0;
    string public symbol = "CFI";
    string public name = "Crowdfunding Investor";
    uint256 public totalSupply;
    mapping (address => uint) public balanceOf;
    mapping (bytes32 => string) public data;   

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(uint256 p0, string p1) public { 
        setData(p0, p1);
    }
    
    function setData(uint256 initialSupply, string SupplierName) public 
    {
        totalSupply = initialSupply ;  
        balanceOf[msg.sender] = initialSupply;            
        data["name"] = SupplierName;
        Transfer(0x00, msg.sender, totalSupply);
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

