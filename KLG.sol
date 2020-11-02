pragma solidity ^0.4.16;


contract KLG
{
    uint public decimals = 0;
    uint256 public totalSupply;
    mapping (address => uint) public balanceOf;
    mapping (bytes32 => string) public data;   

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);

    constructor(uint256 initialSupply, string assetName, string issuer , string description, string contact_name,
    string  contact_email,  string  contact_address, string  contact_phone,string  matter_number, string  file_hash, string  effective_dates) public { 
        setData(initialSupply, assetName, issuer, description, contact_name, contact_email, contact_address, contact_phone, matter_number, file_hash, effective_dates);
    }

    function setData(uint256 initialSupply, string assetName, string issuer , string description, string contact_name,
    string  contact_email,  string  contact_address, string  contact_phone,string  matter_number, string  file_hash, string  effective_dates) public 
    {
        totalSupply = initialSupply;
        balanceOf[msg.sender] = totalSupply;            
        data["assetName"] = assetName;
        data["issuer"] = issuer;
        data["description"] = description;
        data["ContactName"] = contact_name;
        data["ContactEmail"] = contact_email;
        data["ContactAddress"] = contact_address;
        data["ContactPhone"] = contact_phone;
        data["MatterNumber"] = matter_number;
        data["FileHash"] = file_hash;
        data["EffectiveDates"] = effective_dates;
        
       Transfer(0x00, msg.sender, totalSupply);
    }
    
    
    function getData() public view returns (string, string, string , string ,string ,  string , string) 
    {
      return (data["assetName"],data["issuer"],data["description"],data["ContactName"],data["ContactEmail"],data["ContactAddress"],
       data["ContactPhone"]);
    }
    
     function getmetadata() public view returns (string , string  , string) 
    {
      return (data["MatterNumber"],data["FileHash"],data["EffectiveDates"]);
    }
   
    function _transfer(address _from, address _to, uint _value) internal 
    {
        
        require (_to != 0x0);                               
        require (balanceOf[_from] >= _value);               
        require (balanceOf[_to] + _value > balanceOf[_to]); 
        balanceOf[_from] -= _value;                         
        balanceOf[_to] += _value;                           
        Transfer(_from, _to, _value);
    }

   
    function transfer(address _to, uint256 _value) public {
        _transfer(msg.sender, _to, _value);
    }


  
    function burn(uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);   
        balanceOf[msg.sender] -= _value;            
        totalSupply -= _value;                     
        Burn(msg.sender, _value);
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
	
	/*function getExecutionid() constant returns (string)
    {
        return data["Executionid"];
    }*/

}

