// SPDX-License-Identifier: unlicensed

pragma solidity 0.8.11;
 
contract Whitelist {
   mapping(address => bool) whitelist;
   Person[] public persons;
   event Authorized(address _address);
   event Blacklisted(address _address);

   struct Person {
       string name;
       uint age;
   }
 
   function set(address addresstoadd, bool isWhite) public {
       whitelist[addresstoadd] = isWhite;
   }
 
   function get(address addresstocheck) public view returns (bool) {
       return whitelist[addresstocheck];
   }

   function addPerson(string memory _name, uint _age) public {
       persons.push(Person(_name, _age));
   }

   function removePerson() public {
       persons.pop();
   }

   function Authorize(address _address) public {
       whitelist[_address] = true;
       emit Authorized(_address);
   }

   function NotAuthorize(address _address) public {
       whitelist[_address] = false;
       emit Blacklisted(_address);
   }
}
