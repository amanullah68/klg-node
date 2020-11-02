/*
	This API is CCG-API and is Copyrights of MWAN MOBILE LTD
	Created and Developed by : Tayyab Hussain & Sadia Abbas
	Software Engineer
	MWAN Mobile LTD
*/
var http = require('http');
var Web3 = require('web3');
var fs = require('fs');
var solc = require('solc');
var util = require('ethereumjs-util');
var tx = require('ethereumjs-tx');
var lightwallet = require('eth-lightwallet');
var txutils = lightwallet.txutils;
var keyth=require('keythereum');
//var Colu = require('colu');
var express = require('express');
var mysql = require("mysql");
var request = require('request');
//var redis = require('redis');
var md5 = require('md5');
var utilLogger = require('util');
//var sleep = require('sleep');
const postToApi = require('./postApi');
var path = require('path');


var app = express();
var winston = require('winston');
var port = 9596;

var connection = mysql.createConnection({
	host       : 'localhost',
	user       : 'root',
	password   : 'test',
	database   : 'klg',
	port       :  3306

    // host: 'localhost',
    // user: 'root',
    // password: '',
    // database: 'klg-db'

});

var TEST_NET_API_URL = 'http://testnet.api.coloredcoins.org:80/v3/';
var hostName = 'https://rinkeby.infura.io/';
var path_to_keys = '/root/.ethereum/';//'./pnet';//'D:/wamp64/www/New-Node-With-Ethereum/pnet';
var unlockPassword = "i am Mwan Pakistan Blockchain"; //for live it should be something else

// var logger = new (winston.Logger)({
// 	transports: [
// 	  new (winston.transports.Console)(),
// 	  new (winston.transports.File)({ filename: 'logfile.log' })
// 	]
// });

var web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/'));
if (typeof web3 !== 'undefined') {
	//console.log('show excute');
	var sourceCode = fs.readFileSync('KLG.sol').toString();
	var compiledCode = solc.compile(sourceCode);

	// change
	var abiDefinition = "abc";
	var byteCode = "abc";
}

//////////******* Testing Wether Server is running or not ///
app.get('/pingtest', function (req, res){
	//console.log('/pingtest function is called');
	message = {
		'200': "We are up and running"
	};
	//console.log(message);
	res.send(message);
});

//////////////////////****************VERIFYING CCG ****************///////////////////////////////////////////////

function verify(name, pass, hashkey, Ip, flag) {
    try {
        var sql = "SELECT bitcoin_address, privateKey FROM users WHERE Username =  '" + name + "'and Password = '" + pass + "' and HashKey = '" + hashkey + "' and User_type='superuser'";
        var flg = 0;
        connection.query(sql, function (err, results){
            if (err){
                console.log('Error: ' + err);
            }
            if (results.length > 0) {
                firstResult = results[0];
                if (firstResult) {
                    flg = 1;
					flag(flg);
                } else {
					flg = 0;
                    flag(flg);
                }
            }
            else {
				console.log('ER0003: Request unauthorized.');
                flg = 0;
                flag(flg);
            }
        });
    }
    catch (ex){
        console.log('Exception Arise: ' + ex);
    }
}

function verifyCCG(Bitcoin,Key,hashkey ,flag) {
    try {
        var sql = "SELECT bitcoin_address, privateKey FROM users WHERE Bitcoin_address =  '" + Bitcoin + "' and PrivateKey='"+Key+"' and hashkey='"+hashkey+"'";
        var flg = 0;
        connection.query(sql, function (err, results){
			if (err) {
                console.log('Error: ' + err);
            }
            if (results.length > 0) {
				firstResult = results[0];
                if (firstResult) {
                    flg = 1;
                    flag(flg);
                 } 
				 else {
					flg = 0;
                    flag(flg);
                }
            }
            else{
				console.log('ER0003: Request unauthorized.');
                flg = 0;
                flag(flg);
            }
        });
    }
    catch (ex){ 
		console.log('Exception Arise: ' + ex);
	}
}

function verifyTransfer(Bitcoin,Key ,receiver_address,flag) {
    try {
        var sql = "SELECT Bitcoin_address, PrivateKey,User_type FROM users WHERE Bitcoin_address =  '" + Bitcoin + "' and PrivateKey='"+Key+"' ";
        var flg ;
        connection.query(sql, function (err, results) {
            if (err) {
				console.log('Error: ' + err);
            }
            if (results.length > 0) {
                firstResult = results[0];
                if(firstResult.User_type=="superuser"|| firstResult.User_type=="member_IFI") {
                    if (firstResult) {
                        flg = 1;
                        flag(flg);
                    } else {
						flg = 0;
                        checking();
                    }
                }
                else {
					console.log('ER0003: Request unauthorized');
                    flg = 0;
                    checking();
                }
            }
            else {
				console.log('ER0003: Request unauthorized');
                flg = 0;
                checking();
            }
        });
		
        function checking(){
			if(flg==0 ) {
				var sqli = "SELECT BitcoinAddress, PrivateKey,Type,IFI_Parent FROM client  WHERE  BitcoinAddress =  '" + Bitcoin + "' and PrivateKey='" + Key + "'  ";
				connection.query(sqli, function (err, results) {
					if (err){
						console.log('Error: ' + err);
					}
					if (results.length > 0) {
						firstResult = results[0];
						if (firstResult.Type == "Client" || firstResult.Type == "Liaison") {
							if (firstResult) {
								if(firstResult.Type=="Client"){
									verify_parent(firstResult.IFI_Parent,receiver_address,function(ids) {
										
										if(ids==1){
											flg = 1;
											flag(flg);
										}
										else{
											flg = 2;
											flag(flg);
										}
									})
								}
								else{
									flg = 1;
									flag(flg);
								}
							} 
							else {
								flg = 0;
								flag(flg);
							}
						}
						else{
							flg = 0;
							flag(flg);
						}
					}
					else {
						flg = 0;
						flag(flg);
					}
				});
			}
			else {
				flg = 0;
				flag(flg);
			}
		}
    }
    catch (ex){
		console.log('Exception Arise: ' + ex);
    }
}


function verify_parent(ifi_parent,receiveraddress,flag){
    try {
        var sql = "SELECT Bitcoin_address, PrivateKey,User_type FROM users WHERE Bitcoin_address='"+receiveraddress+"' and PrivateKey='"+ifi_parent+"' ";
        var flg ;
        connection.query(sql, function (err, results) {
            if (err) {
                console.log('Error: ' + err);
            }
            if (results.length > 0) {
                firstResult = results[0];
                if(firstResult.User_type=="superuser"|| firstResult.User_type=="member_IFI") {
                    if (firstResult) {
						flg = 0;
						flag(flg);
					} else {
						flg = 0;
						checking();
					}
                }
                else {
					flg = 0;
					checking();
                }
            }
            else {
				console.log('ER0003: Request unauthorized');
                flg = 0;
                checking();
            }
        });
		
        function checking(){
            if(flg==0 ) {
                var sqli = "SELECT Type,IFI_Parent FROM client  WHERE   BitcoinAddress='"+receiveraddress+"' and IFI_Parent='"+ifi_parent+"' ";
				connection.query(sqli, function (err, results) {
                    if (err) {
                        console.log('Error: ' + err);
                    }
					if (results.length > 0) {
                        firstResult = results[0];
                        if (firstResult.Type == "Client" || firstResult.Type == "Liaison") {
							if (firstResult) {
                                flg = 0;
								flag(flg);
                            } 
							else {
								flg = 1;
                                flag(flg);
                            }
                        }
                        else {
							console.log('ER0003: Request unauthorized');
                            flg = 0;
                            flag(flg);
                        }
                    }
                    else {
						console.log('ER0003: Request unauthorized');
						flg = 1;
                        flag(flg);
                    }
                });
            }
            else {
                flg = 0;
                flag(flg);
            }
        }
    }
    catch (ex){
		console.log('Exception Arise: ' + ex);
    }
}


function verifyReceiver(receiver_address,sender_address,flag) {
    try {
        var sql = "SELECT Bitcoin_address, PrivateKey,User_type FROM users WHERE Bitcoin_address='"+receiver_address+"' ";
        var flg ;
        connection.query(sql, function (err, results) {
            if (err) {
                console.log('Error: ' + err);
            }
            if (results.length > 0) {
                firstResult = results[0];
                if(firstResult.User_type=="superuser"|| firstResult.User_type=="member_IFI") {
                    if (firstResult) {
                        flg = 1;
                        flag(flg);
                    } 
					else {
						flg = 0;
                        checking();
					}
                }
                else{
					console.log('ER0003: Request unauthorized');
                    flg = 0;
                    checking();
                }
            }
            else {
				console.log('ER0003: Request unauthorized');
                flg = 0;
                checking();
            }
        });
		
        function checking(){
            if(flg==0 ) {
                var sqli = "SELECT Type FROM client  WHERE   BitcoinAddress='"+receiver_address+"' ";
                connection.query(sqli, function (err, results) {
                    if (err) {
                        console.log('Error: ' + err);
                    }
					if (results.length > 0) {
                        firstResult = results[0];
                        if (firstResult.Type == "Client" || firstResult.Type == "Liaison") {
                            if (firstResult) {
                                flg = 1;
                                flag(flg);
                            } 
							else {
								flg = 0;
                                flag(flg);
                            }
                        }
                        else{
							console.log('ER0003: Request unauthorized');
                            flg = 0;
                            flag(flg);
                        }
                    }
                    else{
                        console.log('ER0003: Request unauthorized');
                        flg = 0;
                        flag(flg);
                    }
                });
            }
            else {
                flg = 0;
                flag(flg);
            }
        }
    }
    catch (ex){
		console.log('Exception Arise: ' + ex);
    }
}

//////////////////************************** CREATE CLIENT**********************//////////////////////////////////////

app.post('/createClient', function (req, res){
    var postData = userData =userprivateSeed=bitcoins=p_key= '';

    var username = password = hashkey = ip = Name=Type=UID=IFI_Parent=IFI_Reference=ExternalRef1=ExternalRef2='';
    req.on('data', function (data) {
        postData = data;
    });

    req.on('end', function () {
        try {
            try {
                postData = JSON.parse(postData);
			
                if (!(postData.username) || !(postData.password) || !(postData.hashkey) || !(postData.Name) || !(postData.UID) || !(postData.IFI_Parent)
                    || !(postData.IFI_Reference)) {
					console.log('ER0002: You have not provided all the mandatory details.');
                    res.send('{"errorcode":"ER0002","message":"You have not provided all the mandatory details."}');
				}
                else {
                    username = postData.username;
                    password = md5(postData.password);
                    hashkey = postData.hashkey;
                    Name = postData.Name;
                    UID = postData.UID;
                    IFI_Parent = postData.IFI_Parent;
                    IFI_Reference = postData.IFI_Reference;
                    ExternalRef1 = postData.ExternalRef1;
                    ExternalRef2 = postData.ExternalRef2;
                    ip = "";
					console.log('Input for /createClient method is username: ' + username + ', password: ' + password + ', hashkey: ' + hashkey + ', Name: ' + Name + ', UID: ' + UID + ', IFI_Parent: ' + IFI_Parent + ', IFI_Reference' + IFI_Reference + ', ExternalRef1: ' + ExternalRef1 + ',ExternalRef2: ' + ExternalRef2);
					
                    var response;
                    //     console.log("after call ");
                    //if (postData.Username == '' || postData.Password == '' || postData.HashKey == '' || postData.Ip != '' || postData.Name == '' || postData.Type == '' || postData.UID == '' || postData.IFI_Parent == '' || postData.IFI_Reference == '' || postData.ExternalRef1 == '' || postData.ExternalRef2 == '') {
                    //    res.send('{"error":"Method not Allowed"}');
                    //}else {
					verify(username, password, hashkey, ip, function (id) {
                        response = id;
						
                        if (response == 0) {
							console.log('ER0003: Request unauthorized.');
                            res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');
                        }
                        else {
							insert_clientdata();
						}
                        function insert_clientdata() {
                            getadress();
						}

                        function getadress() {
							console.log('Requesting on Blockchain, parameters arem private seed: ' + userprivateSeed);
                            var sql = "SELECT id,bitcoin,privatekey,status FROM adresses " +
								"WHERE status = 1";
							connection.query(sql, function (err, results) {
								if (err) {
									console.log('Error: ' + err);
								}
								else {
									resultt = results[0];
									if (resultt) {
										bitcoins = resultt.bitcoin;
										p_key = resultt.privatekey;
										client_create(bitcoins,p_key,resultt.id)
									}
									else{
										id="";
										client_create(bitcoins,p_key,id)
									}
								}

							})
							function client_create(bitcoins,p_key,ids){
								if ((p_key != "" || p_key != []) && (bitcoins != "" && bitcoins != [])) {
									var types = "Client"

									var mysqls = "insert into client (Name,Type,UID,IFI_Parent,IFI_Reference,ExternalRef1,ExternalRef2,BitcoinAddress,PrivateKey) values('" + Name + "', '" + types + "','" + UID + "','" + IFI_Parent + "','" + IFI_Reference + "','" + ExternalRef1 + "','" + ExternalRef2 + "','" + bitcoins + "','" + p_key + "')";
									connection.query(mysqls, function (err, results) {
										if (err) {
											if (err.errno == 1062) {
												console.log('ER0008: Duplicate entry please choose unique');
												res.send('{"errorcode":"ER0008","message":"Duplicate entry please choose unique"}');
											}
											else {
												console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details');
												res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details"}');
											}
										}
										else {
											update_status(ids)
											datas1 = {
												'UserId': results.insertId,
												'BlockchainAddress': bitcoins,
												'BlockchainPrivateKey': p_key,
												'UID': UID,
												'Name': Name,
												'IFI_Parent': IFI_Parent,
												'IFI_Reference': IFI_Reference,
												'ExternalRef1': ExternalRef1,
												'ExternalRef2': ExternalRef2
											};
											console.log('Sending Response: ' + utilLogger.inspect(datas1, false, null));
											res.send(datas1);
										}
									});
								}
								else {
									bitcoinaddress = colu.hdwallet.getAddress()
									if ((bitcoinaddress != "" || bitcoinaddress != []) && (userprivateSeed != "" && userprivateSeed != [])) {
										//  res.send("private see is :" + userprivateSeed+ "::::::  and bitcoin adress is: "+ bitcoinaddress);
										var types = "Client"

										var sql = "insert into client (Name,Type,UID,IFI_Parent,IFI_Reference,ExternalRef1,ExternalRef2,BitcoinAddress,PrivateKey) values('" + Name + "', '" + types + "','" + UID + "','" + IFI_Parent + "','" + IFI_Reference + "','" + ExternalRef1 + "','" + ExternalRef2 + "','" + bitcoinaddress + "','" + userprivateSeed + "')";

										connection.query(sql, function (err, results) {
											if (err){
												if (err.errno == 1062) {
													console.log('ER0008: Duplicate entry please choose unique');
													res.send('{"errorcode":"ER0008","message":"Duplicate entry please choose unique"}');

												}
												else {
													console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details');
													res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details"}');
												}
											}
											else {
												datas1 = {
													'UserId': results.insertId,
													'BlockchainAddress': bitcoinaddress,
													'BlockchainPrivateKey': userprivateSeed,
													'UID': UID,
													'Name': Name,
													'IFI_Parent': IFI_Parent,
													'IFI_Reference': IFI_Reference,
													'ExternalRef1': ExternalRef1,
													'ExternalRef2': ExternalRef2
												};
												console.log('Sending Response: ' + utilLogger.inspect(datas1, false, null));
												res.send(datas1);
											}
										});
									}
									else {
										console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details');
										res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details"}');
									}
								}
							}
                        }
                    });
                }
            }
            catch (ex) {
				console.log('Exception: ' + ex);
            }
        }
        catch(ex) {
			console.log('Exception: ' + ex);
        }
	});

    function update_status(id){
		try {
            var sqls = "update adresses set status=0 where id='" + id + "'";
            connection.query(sqls, function (err, results) {
                if (err) {
					console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
					res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
                }
                if (results){ } else { }
            });
        }
        catch(ex){
			console.log('Exception: ' + ex);
		}
    }
});

//////////////////////////********************CREATE LIAISON***************************//////////////////////

app.post('/createLiaison', function (req, res){
    var postData = userData =userprivateSeed=bitcoins=p_key= '';

    var username = password = hashkey = ip = Name=Type=UID=IFI_Parent=IFI_Reference=ExternalRef1=ExternalRef2='';
    req.on('data', function (data) {
        postData = data;
    });

    req.on('end', function () {
        try {
            try {
                postData = JSON.parse(postData);
				
                if (!(postData.username) || !(postData.password) || !(postData.hashkey) || !(postData.Name) || !(postData.UID) || !(postData.IFI_Parent)
                    || !(postData.IFI_Reference) ) {
					console.log('ER0002: You have not provided all the mandatory details.');
					res.send('{"errorcode":"ER0002","message":"You have not provided all the mandatory details."}');
                }
                else {
                    username = postData.username;//username
                    password = md5(postData.password);
                    hashkey = postData.hashkey;
                    Name = postData.Name;
                    UID = postData.UID;
                    IFI_Parent = postData.IFI_Parent;
                    IFI_Reference = postData.IFI_Reference;
                    ExternalRef1 = postData.ExternalRef1;
                    ExternalRef2 = postData.ExternalRef2;
                    ip = "";
					console.log('Input for /createLiaison method is username: ' + username + ', password: ' + password + ', hashkey: ' + hashkey + ', Name: ' + Name + ', UID: ' + UID + ', IFI_Parent: ' + IFI_Parent + ', IFI_Reference' + IFI_Reference + ', ExternalRef1: ' + ExternalRef1 + ',ExternalRef2: ' + ExternalRef2);
					
                    var response;
                    //     console.log("after call ");
                    //if (postData.Username == '' || postData.Password == '' || postData.HashKey == '' || postData.Ip != '' || postData.Name == '' || postData.Type == '' || postData.UID == '' || postData.IFI_Parent == '' || postData.IFI_Reference == '' || postData.ExternalRef1 == '' || postData.ExternalRef2 == '') {
                    //    res.send('{"error":"Method not Allowed"}');
                    //}else {
					verify(username, password, hashkey, ip, function (id) {
						response = id;
						if (response == 0) {
							console.log('ER0003: Request unauthorized.');
							res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');
                        }
                        else {
							insert_clientdata();
                        }
                        function insert_clientdata() {
                            getadress();
                        }

                        function getadress() {
							console.log('Requesting on Blockchain, parameters are, private seed: ' + userprivateSeed);
							var sql = "SELECT  id,bitcoin,privatekey,status FROM adresses " +
								"WHERE status = 1";
							connection.query(sql, function (err, results) {
								if (err) {
									console.log('Error: ' + err);
								}
								else {
									resultt = results[0];
									if (resultt){
										bitcoins = resultt.bitcoin;
										p_key = resultt.privatekey;
										client_create(bitcoins,p_key,resultt.id)
									}
									else{
										id="";
										client_create(bitcoins,p_key,id)
									}
								}
							})
							function client_create(bitcoins,p_key,ids){
								if ((p_key != "" || p_key != []) && (bitcoins != "" && bitcoins != [])) {
									var types = "Liaison"

									var mysqls = "insert into client (Name,Type,UID,IFI_Parent,IFI_Reference,ExternalRef1,ExternalRef2,BitcoinAddress,PrivateKey) values('" + Name + "', '" + types + "','" + UID + "','" + IFI_Parent + "','" + IFI_Reference + "','" + ExternalRef1 + "','" + ExternalRef2 + "','" + bitcoins + "','" + p_key + "')";
									connection.query(mysqls, function (err, results) {
										if (err){
											if (err.errno == 1062){
												console.log('ER0008: Duplicate entry please choose unique');
												res.send('{"errorcode":"ER0008","message":"Duplicate entry please choose unique"}');
											}
											else {
												console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details');
												res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details"}');
											}
										}
										else {
											update_status(ids)
											datas1 = {
												'UserId': results.insertId,
												'BlockchainAddress': bitcoins,
												'BlockchainPrivateKey': p_key,
												'UID': UID,
												'Name': Name,
												'IFI_Parent': IFI_Parent,
												'IFI_Reference': IFI_Reference,
												'ExternalRef1': ExternalRef1,
												'ExternalRef2': ExternalRef2
											};
											console.log('Sending Response: ' + utilLogger.inspect(datas1, false, null));
											res.send(datas1);
										}
									});
								}
								else {
									bitcoinaddress = colu.hdwallet.getAddress()
									if ((bitcoinaddress != "" || bitcoinaddress != []) && (userprivateSeed != "" && userprivateSeed != [])) {
										var types = "Liaison";
										var sql = "insert into client (Name,Type,UID,IFI_Parent,IFI_Reference,ExternalRef1,ExternalRef2,BitcoinAddress,PrivateKey) values('" + Name + "', '" + types + "','" + UID + "','" + IFI_Parent + "','" + IFI_Reference + "','" + ExternalRef1 + "','" + ExternalRef2 + "','" + bitcoinaddress + "','" + userprivateSeed + "')";
										connection.query(sql, function (err, results) {
											if (err){
												if (err.errno == 1062) {
													console.log('ER0008: Duplicate entry please choose unique');
													res.send('{"errorcode":"ER0008","message":"Duplicate entry please choose unique"}');

												}
												else {
													console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details');
													res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details"}');
												}
											}
											else {
												datas1 = {
													'UserId': results.insertId,
													'BlockchainAddress': bitcoinaddress,
													'BlockchainPrivateKey': userprivateSeed,
													'UID': UID,
													'Name': Name,
													'IFI_Parent': IFI_Parent,
													'IFI_Reference': IFI_Reference,
													'ExternalRef1': ExternalRef1,
													'ExternalRef2': ExternalRef2
												};
												console.log('Sending response');
												res.send(datas1);
											}
										});
									}
									else {
										console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details');
										res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details"}');
									}	
								}
							}
                        }
                    });
                }
            }
            catch (ex) {
				console.log('Exception: ' + ex);
            }
        }
        catch(ex) {
			console.log('Exception: ' + ex);
        }
    });

    function update_status(id){
        try {
            var sqls = "update adresses set status=0 where id='" + id + "'";
            connection.query(sqls, function (err, results) {
                if (err) {
					console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
					res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
                }

                if (results) { } else { }
            });
        }
        catch(ex){
			console.log('Exception: ' + ex);
        }
    }
});

/* //////////////////////****************QUERY ASSET****************///////////////////////////////////////////////

app.post('/queryAsset', function (req, res) {
    var postData = userData = userprivateSeed = '';

    var username = password = hashkey = ip = ReferenceId="";
    req.on('data', function (data) {
        postData = data;
    });

    req.on('end', function () {
        try {
            postData = JSON.parse(postData);
			
            username = postData.username;//username
            password =md5(postData.password);
            hashkey = postData.hashkey;
            ReferenceId = postData.ReferenceId;
            ip="";
			console.log('Input for /queryAsset method is username: ' + username + ', password: ' + password + ', hashkey: ' + hashkey + ', ReferenceId: ' + ReferenceId);
			
            verify(username, password, hashkey, ip, function (id) {
                response = id;
                if (response == 0) {
					console.log('ER0003: Request unauthorized.');
                    res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');
                }
                else {
                    var sql = "SELECT  Id as ReferenceId,Status FROM assets " +
                        "WHERE Id =" + postData.ReferenceId + "";
                    connection.query(sql, function (err, rows,fields) {
                        if (err) {
							console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details');
							res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
                        }
                        else {
                            if(rows==[] || rows==''){
								console.log('ER0001: ReferenceId not exists');
								res.send('{"errorcode":"ER0009","message":"ReferenceId not exists"}');
                            }
                            else {
                                for (var i in rows) {
									console.log('Sending Response: ' + utilLogger.inspect(rows[i], false, null));
                                    res.send(rows[i])
                                }
                            }
                        }
                    });
                }
            });
        }
        catch (ex){
            console.log('Exception: ' + ex);
        }
    })
})

//////////////////////****************QUERY TRANSACTION****************///////////////////////////////////////////////

app.post('/queryTransaction', function (req, res) {
    var postData = userData = userprivateSeed = '';

    var username = password = hashkey = ip = ReferenceId="";
    req.on('data', function (data) {
        postData = data;
    });

    req.on('end', function () {
        try {
            postData = JSON.parse(postData);
			
            username = postData.username;//username
            password =md5(postData.password);
            hashkey = postData.hashkey;
            ReferenceId = postData.ReferenceId;
            ip="";
			console.log('Input for /queryTransaction method is username: ' + username + ', password: ' + password + ', hashkey: ' + hashkey + ', ReferenceId: ' + ReferenceId);
			
            verify(username, password, hashkey, ip, function (id) {

                response = id;
				if (response == 0) {
					console.log('ER0003: Request unauthorized.');
					res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');
                }
                else {
                    //var sqlss = "SELECT Id as ReferenceId ,Txid,Status,Error FROM transferasset WHERE Id =" + postData.ReferenceId + "";
					var sqlss = "SELECT transferasset.Id AS ReferenceId ,transferasset.Txid,transferasset.Status,transferasset.Error,transfer_relation.status AS transfer_status FROM transfer_relation INNER JOIN transferasset ON (transfer_relation.transfer_id = transferasset.Id) WHERE transferasset.Id = " + postData.ReferenceId + "";
					connection.query(sqlss, function (err, rows,fields) {
                        if (err) {
							console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
							res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
                        }
                        else {
                            if(rows==[] || rows==''){
								console.log('ER0009: ReferenceId not exists');
								res.send('{"errorcode":"ER0009","message":"ReferenceId not exists"}');
                            }
                            else {
                                for (var i in rows) {
                                    if (rows[i].Status == "FAILED") {
                                        if(rows[i].Error=='{"ER0004":"No asset found"}') {
                                            var associativeArray = {};
                                            associativeArray['ReferenceId'] = rows[i].ReferenceId;
                                            associativeArray['Status'] = rows[i].Status;
                                            associativeArray['error'] = "ER0007";
                                            associativeArray['message'] = rows[i].Error;
											myJsonString = JSON.stringify(associativeArray);
                                            
											console.log('Sending response: ' + utilLogger.inspect(associativeArray, false, null));
											res.send(myJsonString);
                                        }
                                        else {
                                            if(rows[i].Error=="Internal server error"&& (rows[i].Txid==""||rows[i].Txid==null)) {
												data = {
													"ReferenceId": rows[i].ReferenceId,
													"Status": rows[i].Status,
													"errorcode": "ER0015",
													"message": rows[i].Error
												};
                                            }
                                            else {
                                                data = {
                                                    "ReferenceId": rows[i].ReferenceId,
                                                    "Status": rows[i].Status,
                                                    "errorcode": "ER0007",
                                                    "message": rows[i].Error
                                                };
                                            }
											console.log('Sending response: ' + utilLogger.inspect(data, false, null));
                                            res.send(data);
                                        }
                                    }
                                    else {
                                        datass = {
                                            "ReferenceId": rows[i].ReferenceId,
                                            "Status": rows[i].transfer_status//Status
                                        };
										console.log('Sending response: ' + utilLogger.inspect(datass, false, null));
                                        res.send(datass)
                                    }
                                }
                            }
                        }
                    });
                }
            });
        }
        catch (ex){
			console.log('Exception: ' + ex);
        }
    })
})

//////////////////////****************CREATE ASSET****************///////////////////////////////////////////////

app.post('/createAsset', function (req, res) {
    var postData = userData =userprivateSeed= '';

    var username =quntity= password = hashkey = ip= BlockChainAddress=BlockChainPrivatekey=
        description=ExecutionID= Name=Owner=Country=City=Warehouse=LotNumber=AccountType=IssuerOwner=Producer=ExtRef1=ExtRef2=Quantity=type='';

    req.on('data', function (data){
        postData = data;
    });

    req.on('end', function () {
        try {
            postData = JSON.parse(postData);
			if (!(postData.username) ||
                !(postData.Producer)|| !(postData.password) || !(postData.hashkey) || !(postData.BlockChainAddress)
                || !(postData.BlockChainPrivatekey) || !(postData.ExecutionID) ||
                !(postData.Name)|| !(postData.Owner)|| !(postData.Country)||
                !(postData.City)|| !(postData.Warehouse)|| !(postData.LotNumber)||!(postData.IssueOwner)||!(postData.AccountType)) {
                console.log('ER0002: You have not provided all the mandatory details.');
				res.send('{"errorcode":"ER0002","message":"You have not provided all the mandatory details."}');
            }
            else{
                username = postData.username;
                password = md5(postData.password);
                hashkey = postData.hashkey;
                BlockChainAddress = postData.BlockChainAddress;
                BlockChainPrivatekey = postData.BlockChainPrivatekey;
                ExecutionID = postData.ExecutionID;
                Name = postData.Name;
                Owner = postData.Owner;
                Country = postData.Country;
                City = postData.City;
                Warehouse = postData.Warehouse;
                LotNumber = postData.LotNumber;
                AccountType = postData.AccountType;
                IssuerOwner = postData.IssueOwner;
                Producer = postData.Producer;
                ExtRef1 = postData.ExtRef1;
                ExtRef2 = postData.ExtRef2;
                Type = postData.Type;
                ip = "";
				console.log('Input for /createAsset method is username: ' + username + ', password: ' + password + ', hashkey: ' + hashkey + ', BlockChainAddress: ' + BlockChainAddress);
				
                var response;

                quntity = 1000000;
                if (quntity < 1) {
					console.log('Error: Invalid quantity');
					res.send('{"":"Invalid quantity"}');
                }
                else {
					verify(username, password, hashkey, ip, function (id) {
						response = id;

                        if (response == 0) {
							console.log('ER0003: Request unauthorized.');
							res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');
                        }
                        else {
							verifyCCG(BlockChainAddress, BlockChainPrivatekey, hashkey, function (ids) {
                                responses = ids;
                                if (responses == 0) {
									console.log('ER0005: Not authorized to create asset');
									res.send('{"errorcode":ER0005","message":"Not authorized to create asset"}');
                                }
                                else {
									insert_clientdata();
                                }
                            })
                        }

                        function insert_clientdata() {
                            createasset();
                        }

                        function createasset() {

                            var privateSeed = BlockChainPrivatekey
                            var assetId;

                            var types = "client";
                            var sql = "insert into assets (Name,Type,Owner,Country,City,Warehouse,Lotnumber,AccountType,Issueowner,Producer,ExtRef1,ExtRef2,Executionid,Quantity,BitcoinAddress,PrivateKey)" +
                                " values('" + Name + "','" + Type + "','" + Owner + "','" + Country + "','" + City + "','" + Warehouse + "','" + LotNumber + "','" + AccountType + "','" + IssuerOwner + "','" + Producer + "','" + ExtRef1 + "','" + ExtRef2 + "','" + ExecutionID + "'," + quntity + ",'" + BlockChainAddress + "','" + BlockChainPrivatekey + "')";
                            connection.query(sql, function (err, results) {
                                if (err) {
                                    if (err.errno == 1062) {
										console.log('ER0008: Duplicate Entry please choose unique');
										res.send('{"errorcode":"ER0008","message":"Duplicate Entry please choose unique"}');
                                    }
                                    else {
										console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
										res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
                                    }
                                }
                                else {
									datas = {
                                        'ReferenceId': results.insertId,
                                        'Status': "PENDING"
                                    };
									console.log('Sending response: ' + utilLogger.inspect(datas, false, null));
                                    res.send(datas);
                                }
                            })
                        }
                    });
                }
            }
        }
        catch (ex){
			console.log('Exception: ' + ex);
        }
    });
});

//////////////////////**************** ASSET CREATION BACKEND****************///////////////////////////////////////////////
 var address;
    var key;
app.get('/newAssetUpdate', function (req, res){
    var resut="";
    var privateSeed="";
    userprivateSeed="";
   
	
	try {
		var sql = "SELECT users.name,users.email,users.bitcoin_address,users.privateKey,supplier_certificates.id,supplier_certificates.matter_number,supplier_certificates.effective_dates,supplier_certificates.quantity,supplier_certificates.file_hash,supplier_certificates.unit,supplier_certificates.created_at,supplier_certificates.contact_name,supplier_certificates.contact_email,supplier_certificates.address,supplier_certificates.contact_phone FROM users INNER JOIN supplier_certificates ON (users.id = supplier_certificates.supplier_id) WHERE supplier_certificates.isActive = 1 AND supplier_certificates.blockchain_executed = 0 AND supplier_certificates.isApprove = 1 AND supplier_certificates.finalize = 1";
		connection.query(sql, function (err, results) {
            if (err) {
				console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
				res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
            }
            if (results.length>0){
				for (var i = 0; i < results.length; i++) {
					console.log('newAssetUpdate method is called, no initial input is required');
                    resut = results[i];
                    privateSeed = resut.PrivateKey;
					create(resut);
					console.log('Sending Response');
				}
				console.log("okay done!");
                // res.send("okay done!")
            } 
			else {
				console.log("Nothing found ! ");
				res.send("Nothing found ! ");
			}
        });
    }
    catch (ex){
		console.log('Exception: ' + ex);
    }

    function update_asset(assetid,status_bc,id){
        try {
            var sqls = "UPDATE supplier_certificates SET asset_id = '"+assetid+"', blockchain_executed = "+status_bc+" WHERE id=" + id + "";
            connection.query(sqls, function (err, results) {
                if (err) {
                    console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
					res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
                }
                if (results) {
					res.json('Successfully done!');
				} 
				else {}
            });
        }
        catch(ex){
			console.log('Exception: ' + ex);
        }
    }

    function create(result){
		address= result.bitcoin_address;
		key= result.privateKey;

		// New created
		fs.readFile(path.resolve(__dirname, './KLG.sol'), async function (err, data) {
			if (err) throw err;
			console.log(data);
	
			console.log(__dirname + "publicabi");
	
			var sdata = String(data);

			file_hash = result.file_hash;

			if(file_hash == null || file_hash == undefined) {
				file_hash = 'null';
			}
	
			const params = {
				a1: result.quantity,
				a2: 'KLG Gates Contract',
				a3: 'KLG Gates',
				a4: 'KLG Gates creates this Contract',
				a5: result.contact_name,
				a6: result.contact_email,
				a7: result.address,
				a8: result.contact_phone,
				a9: result.matter_number,
				a10: file_hash,
				a11: result.effective_dates
			};
	
			// console.log('params......', sdata);
			const stringifyParams = JSON.stringify(params);
	
			await postToApi.postToApi('ethereum/contract/deploy', {
				'params': stringifyParams,
				'contractName': 'KLG',
				'fileData': sdata,
				'address': address,
				'privateKey': key
			}, function (err, body) {
				messageESR = "";
				console.log('body................', body);
				console.log('errrr........', err);
	
				if (err) {
					console.log('error: ', err);
					throw err;
					// res.send('Error', err);
				}
				else if (body.errorcode == 'ER0004') {
					messageESR = body;
					console.log('hereeeeeeeeeeeeee........',body);
					res.send(body);
				} 
				else if (body.status == 2) {
					messageESR = body.message;
					console.log(messageESR);
					res.send('Error:', messageESR);
				}
				else {
					var s = JSON.stringify(body.abi);
					console.log(s);
					assetID = body.txHash;
					if (body.errorcode) {
						messageESR = body.message;
						console.log(messageESR);
					}
					else if (body.txHash[0] === undefined) {
						console.log('body111....', body.txHash);
						messageESR = 'Nothing return';
						console.log(messageESR);
					}
					else if (body.txHash.includes("Error") === true) {
						messageESR = body.txHash;
						console.log(messageESR);
					} else {
						status_bc = 1;
						update_asset(assetID,status_bc,result.id);
					}
				}
			});
		});
			
	}
});

////////////////////////////////GET_CCG_DETAIL////////////////////////////////////////////
app.post('/assetData', function (req, res) {
    var postData = '';
	var ammount = 0;

    req.on('data', function (data) {
        postData = data;
    });
    req.on('end', function (){
		postData = JSON.parse(postData);
		contractAddress = postData.asset_id;
		console.log('callleddd');
		// contractAddress = '0x9d4c3beaa5ddb0f687ca57d8e4d76de6dc486e28e1d1cdf9b05a7b9e76e981d1';
		
		const params = {
		};
		var paramsa = JSON.stringify(params);
	
		var p = {
			abi: '[{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"data\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"initialSupply\",\"type\":\"uint256\"},{\"name\":\"assetName\",\"type\":\"string\"},{\"name\":\"issuer\",\"type\":\"string\"},{\"name\":\"description\",\"type\":\"string\"},{\"name\":\"contact_name\",\"type\":\"string\"},{\"name\":\"contact_email\",\"type\":\"string\"},{\"name\":\"contact_address\",\"type\":\"string\"},{\"name\":\"contact_phone\",\"type\":\"string\"},{\"name\":\"matter_number\",\"type\":\"string\"},{\"name\":\"file_hash\",\"type\":\"string\"},{\"name\":\"effective_dates\",\"type\":\"string\"}],\"name\":\"setData\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"supply\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"decimals\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"getData\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"},{\"name\":\"\",\"type\":\"string\"},{\"name\":\"\",\"type\":\"string\"},{\"name\":\"\",\"type\":\"string\"},{\"name\":\"\",\"type\":\"string\"},{\"name\":\"\",\"type\":\"string\"},{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"burn\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"getmetadata\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"},{\"name\":\"\",\"type\":\"string\"},{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"name\":\"initialSupply\",\"type\":\"uint256\"},{\"name\":\"assetName\",\"type\":\"string\"},{\"name\":\"issuer\",\"type\":\"string\"},{\"name\":\"description\",\"type\":\"string\"},{\"name\":\"contact_name\",\"type\":\"string\"},{\"name\":\"contact_email\",\"type\":\"string\"},{\"name\":\"contact_address\",\"type\":\"string\"},{\"name\":\"contact_phone\",\"type\":\"string\"},{\"name\":\"matter_number\",\"type\":\"string\"},{\"name\":\"file_hash\",\"type\":\"string\"},{\"name\":\"effective_dates\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"from\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Burn\",\"type\":\"event\"}]',
			txHash: contractAddress,
			method: "getData"
		};
	
		postToApi.postToApi('ethereum/contract/getContractMethod', p, function (err, body) {
			console.log('body........', body);
			// res.send(body);
			messageESR = "";
			if (err) {
				console.log('error: ', err);
				res.send(err);
				// flag(0);
			}
			else if (body.status == 2) {
				messageESR = body.message;
				// flag(0);
				res.send(messageESR);
			}
			else if (body.errorcode == "404") {
				console.log('hereeeeeeeeeeee');
				messageESR = body.message;
				res.send(messageESR);
			}
			else {
				console.log('body....', body);
	
				if (body.errorcode) {
					messageESR = body.message;
					// flag(0);
				}
				else {
					console.log('body', body);
					if (body === undefined) {
						console.log('body111....', body);
						messageESR = 'Nothing return';
						res.send('Error:', messageESR);
						// flag(0);
					}
					 else {
						// insertIntoTransactionBuyer([body.txHash, assets[5]], function (returnResult) {
						//     console.log('Return: ' + returnResult);
						// });
						p.method = "getmetadata";
						postToApi.postToApi('ethereum/contract/getContractMethod', p, function (err, body1) {
							console.log('body........', body1);
							// res.send(body);
							messageESR = "";
							if (err) {
								console.log('error: ', err);
								res.send(err);
								// flag(0);
							}
							else if (body1.status == 2) {
								messageESR = body1.message;
								// flag(0);
								res.send(messageESR);
							}
							else if (body1.errorcode == "404") {
								console.log('hereeeeeeeeeeee');
								messageESR = body1.message;
								res.send(messageESR);
							}
							else {
								console.log('body....', body1);
					
								if (body1.errorcode) {
									messageESR = body.message;
									// flag(0);
								}
								else {
									console.log('body', body1);
									if (body1 === undefined) {
										console.log('body111....', body1);
										messageESR = 'Nothing return';
										// flag(0);
									}
									 else {
										// insertIntoTransactionBuyer([body.txHash, assets[5]], function (returnResult) {
										//     console.log('Return: ' + returnResult);
										// });
										console.log('done', body1[0]);
										// body = JSON.parse(body);
										newmetadata = body1['result'].split(',');

										console.log('newmetadataaaaaaa', newmetadata);
										// body = JSON.parse(body);
										newmetadata1 = body['result'].split(',');
										// newmetadata = metadata.split(',')
										data = {
											"assetName" : newmetadata1[0],
											"issuer" : newmetadata1[1],
											"description" : newmetadata1[2],
											"Contact Name" : newmetadata1[3],
											"Contact Email" : newmetadata1[4],
											"Contact Address" : newmetadata1[5],
											"Contact Phone" : newmetadata1[6],
											"Matter Number":newmetadata[0],
											"File Hash":newmetadata[1],
											"Effective Dates":newmetadata[2],
											"Date Created":newmetadata[3],
										}
										res.send(data);
										// flag(1);
									}
								}
							}
						});
						
						// flag(1);
					}
				}
			}
		});

        
		// var ip = '';
		// console.log('Input for /assetData method is contractAddress: ' + contractAddress);
		
		// var contract = web3.eth.contract(abiDefinition);
		// var instance = contract.at(contractAddress); 
		// var data = instance.getData.call().toString();
		// newmetadata1 = data.split(',');

		// var metadata = instance.getmetadata.call().toString();
		// newmetadata = metadata.split(',')
		// data = {
		// 	"assetName" : newmetadata1[0],
		// 	"issuer" : newmetadata1[1],
		// 	"description" : newmetadata1[2],
		// 	"Contact Name" : newmetadata1[3],
		// 	"Contact Email" : newmetadata1[4],
		// 	"Contact Address" : newmetadata1[5],
		// 	"Contact Phone" : newmetadata1[6],
		// 	"Matter Number":newmetadata[0],
		// 	"File Hash":newmetadata[1],
		// 	"Effective Dates":newmetadata[2],
		// 	"Date Created":newmetadata[3],
		// }
		// res.send(data);
    })
})


////////////////////*****************************************************TRANSFER Asset*********************************************////////////////////////////////////////////////

app.post('/transferAsset', function (req, res){
    var postData = userData =userprivateSeed= '';
    var username = password = hashkey = ip= BlockChainAddress=BlockChainPrivatekey=
        description=ExecutionID= Name=Owner=Country=City=Warehouse=LotNumber=AccountType=IssuerOwner=Producer=ExtRef1=ExtRef2=Quantity=PhoneNumber='';
    req.on('data', function (data) {
        postData = data;
    });

    req.on('end', function () {
        try {
            postData = JSON.parse(postData);
			
            if (!(postData.username) || !(postData.password) || !(postData.hashkey) || !(postData.SenderAddress) || !(postData.ReceiverAddress) || !(postData.SenderPrivatekey)  || !(postData.ExecutionID) || !(postData.Quantity)){
                console.log('ER0002: You have not provided all the mandatory details.' + (utilLogger.inspect(postData, false, null)));
				res.send('{"errorcode":"ER0002","message":"You have not provided all the mandatory details."}');
            }
            else {
                username = postData.username;
                password = md5(postData.password);
                hashkey = postData.hashkey;
                SenderAddress = postData.SenderAddress;
                SenderPrivatekey = postData.SenderPrivatekey;
                RecieverAddress = postData.ReceiverAddress;
                ExecutionID = postData.ExecutionID;
                Quantity = postData.Quantity;
                ExtRef1 = postData.ExtRef1;
                ExtRef2 = postData.ExtRef2;
                ip = "";
				console.log('Input for /transferAsset method is: ' + utilLogger.inspect(postData, false, null));
				
				var response;
                verify(username, password, hashkey, ip, function (id) {
					response = id;

                    if (response == 0){
						console.log('ER0003: Request unauthorized.');
						res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');
                    }
                    else {
						verifyTransfer(SenderAddress,SenderPrivatekey,RecieverAddress ,function (id) {
                            if (id == 0|| id==2){
                                if(id==0) {
									console.log('ER0003: Request unauthorized.');
									res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');
                                }
                                else {
									console.log('ER0010: Not allowed Murabaha');
									res.send('{"errorcode":"ER0010","message":"Not allowed Murabaha"}');
                                }

                            }else {
								verifyReceiver(RecieverAddress ,SenderAddress,function (id) {
                                    if (id == 0) {
										console.log('ER0003: Request unauthorized.');
										res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');

                                    }else {
										insert_clientdata();
                                    }
                                })
                            }
                        })
                    }
					
                    function insert_clientdata() {
                        createasset();
                    }

                    function createasset() {

                        var privateSeed = BlockChainPrivatekey
                        var assetId;

                        var sql = "insert into transferasset (RecieverAddress,ExtRef1,ExtRef2,ExecutionId,Quantity,SenderAddress,SenderPrivateKey)" +
                            " values('" + RecieverAddress + "','" + ExtRef1 + "','" + ExtRef2 + "','" + ExecutionID + "'," + Quantity + ",'" + SenderAddress + "','" + SenderPrivatekey + "')";
                        connection.query(sql, function (err, results){
                            if (err){
                                if (err.errno == 1062) {
									console.log('ER0008: Duplicate Entry please choose unique');
									res.send('{"errorcode":"ER0008","message":"Duplicate Entry please choose unique"}');
                                }
                                else {
									console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
									res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
                                }
                            }
                            else {
								datas = {
                                    'ReferenceId': results.insertId,
                                    'Status': "PENDING"
                                };
								console.log('Sending Response: ' + utilLogger.inspect(datas, false, null));
                                res.send(datas);
                            }
                        })
                    }
                });
            }
        }
        catch(ex){
            console.log('Exception: ' + ex);
            res.send("Error: " + ex);
        }
    });
});

function  update_progress_status(status1){
    var flg;
    try {
        var sqls = "update transferasset set Dev_Status='INPROGRESS' where Id="+status1+"";
        connection.query(sqls, function (err, results) {
            if (err){
				console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
				res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
            }
			if (results){
				flg=1;
			} else {
				flg=0;
			}
		});
    }
    catch(ex){
		console.log('Exception: ' + ex);
	}
}

function checking_status(result){
    var sql = "SELECT COUNT(id) as Id FROM transferasset WHERE  Dev_Status='INCOMPLETE' || Dev_Status='INPROGRESS' ORDER BY Id ASC"
    connection.query(sql, function (err, results){
        if(err){
			console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
		}
        else{
            result(results[0].Id)
        }
    });
}

//////////////////////**************** TRANSFER ASSET BACKEND ****************///////////////////////////////////////////////

app.post('/newAssetTransaction', function (req, res){
    var resut="";
    var privateSeed="";
	var returnStatement;
    userprivateSeed="";
    try{
		checking_status(function(result){
			if(result==0){
				var sql = "SELECT id,RecieverAddress,SenderAddress,SenderPrivateKey,Quantity,ExecutionId,ExtRef1,ExtRef2 FROM transferasset " +
                    "WHERE Dev_Status='PENDING' ORDER BY Id ASC LIMIT 1";
				
				connection.query(sql, function (err, results){
					if (err) {
						console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
						res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
                    }
					if (results.length>0) {
						console.log('newAssetTransactionNew  method is Called, no initial input required');
						var interval = 10 * 10000;
						resut = results[0];
						
						update_progress_status(resut.id)
						privateSeed = resut.SenderPrivateKey;
						quantity_sent = resut.Quantity;
						var myFlagss;
						var sql = "SELECT Txid, AssetId from assets";
						
						connection.query(sql, function (err, assetResults){
							if (err) {
								console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
								res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
							}
							if (assetResults.length>0) {
								var balance = [];
								var contract_add = [];
								getAmountAll(resut,assetResults,quantity_sent, function(returnAmount){
									if(returnAmount){
										getAmount(resut,assetResults,quantity_sent, function(totalAmount){
											if(totalAmount){
												console.log('done');
												txid = 'N/A';
												update_transaction11(txid,resut.id);
												res.send('done');
												/*totalAmount = totalAmount.toString();
												contract_array = totalAmount.split(',');
												for(i=0;i<contract_array.length;i++){
													if(i%2==0){
														balance.push(contract_array[i]);
													}
													else{
														contract_add.push(contract_array[i]);
													}
												}
												console.log(balance);
												console.log(contract_add);*/
												//transferring tokens
												/*buyer_name = 'Test Buyer';
												for(j=0;j<contract_add.length;j++){
													transferAsset(contract_add[j],resut.SenderAddress,resut.SenderPrivateKey,resut.RecieverAddress,quantity_sent,buyer_name,function(returnTransfer){
														console.log('transfer');
														if(returnTransfer){
															console.log('done');
														}
													});
												}*/
												
											}
										});
									}
									else{
										s1=[
											"Invalid quantity"
										]
										error = { 
											"Error":"Invalid quantity"
										}
										update_error(resut.id,s1);
										console.log(error);
										res.send(error);
									}
								});
							}
						});
					}
					else{
						console.log('nohting to do');
						res.send('nohting to do');
					}
				});
			}
			else{
				console.log('not okay');
				res.send('not okay');
			}
		});
	}
	catch (ex){
		console.log('Exception: ' + ex);
		console.log('Exception: ' + ex);
	}
});

function update_transaction11(txid,id){
	try {
		var sqls = "update transferasset set Txid = '"+(txid)+"', Status='SUCCESS',Dev_Status='SUCCESS' where Id=" + id + "";
		connection.query(sqls, function (err, results) {
			if (err){
				console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
				res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
			}
			if (results){ } 
			else { }
		});
	}
	catch(ex){
		console.log('Exception: ' + ex);
	}
}

function getAmountAll(resut,assetResults,quantity_sent,totalAmount){
	console.log('getAmountAll');
	var contract = web3.eth.contract(abiDefinition);
	var totalTokens=0;
	var arry = [];
	var newAmount = flag = 0;
	for (var i = 0; i < assetResults.length; i++){
		var instance = contract.at(assetResults[i].AssetId); 
		var data = instance.balanceOf.call(resut.SenderAddress);
		console.log("Token Balance: " + data);
		totalTokens += Number(data);
	}
	if(quantity_sent > totalTokens){
		console.log('Total Balance: ' + totalTokens);
		totalAmount(flag);
	}
	else{
		flag = 1;
		totalAmount(flag);
	}
}

function getAmount(resut,assetResults,quantity_sent,totalAmount){
	var contract = web3.eth.contract(abiDefinition);
	console.log('getAmount');
	var totalTokens=0;
	var arry = [];
	var newAmount = flag = 0;
	for (var i = 0; i < assetResults.length; i++){
		var instance = contract.at(assetResults[i].AssetId); 
		var data = instance.balanceOf.call(resut.SenderAddress);
		if(data > 0){
			if(data >= quantity_sent){
				console.log('great ! send it');
				inserting_transfer_relation(quantity_sent,assetResults[i].AssetId,resut.id,data,function(insert_id){
					//flagg(myitr,body[i].assetId, ammnt,insert_id);
				})
				//arry.push([data,assetResults[i].AssetId]);
				flag = 1;
				break;
			}
			else{
				quantity_sent = quantity_sent - data;
				inserting_transfer_relation(data,assetResults[i].AssetId,resut.id,data,function(insert_id){
					//flagg(myitr,body[i].assetId, ammnt,insert_id);
				})
				/*if(totalTokens>=quantity_sent){
					
					totalAmount(arry);
					break;
				}
				else{
					arry.push([data,assetResults[i].AssetId]);
					console.log('put it in an array');
					console.log("Token Balance: " + data);
					totalTokens += Number(data);
				}*/
			}
		}
	}
	console.log('flag: ' + flag);
	if(flag){
		totalAmount(1);
	}
}

function inserting_transfer_relation(amnt,asset_id,transfertable_id,a_amount,insert_id){
	var sql = "insert into transfer_relation (transfer_id,assetId,amount,A_amount)" +
		" values('" + transfertable_id + "','" + asset_id + "','" + amnt + "','"+a_amount+"')";
	connection.query(sql, function (err, results){
		if (err) {
			console.log('Error: Error info is given below' + utilLogger.inspect(err,false,null));
		}
		else {
			insert_id(results.insertId);
		}
	})
}

//function for transferring contract
function transferAsset(send_asset,senderAddress,senderPrivateKey,receiverAddress,quantity,receiverName,flag){
	console.log('transferAsset');
	key = senderPrivateKey;
	var txOptions = {
		nonce: web3.toHex(web3.eth.getTransactionCount(senderAddress)),
		gasLimit: web3.toHex(2000000),
		gasPrice: web3.toHex(40000000000),
		value:0x00, // or just 0
		to: send_asset //it is contract address
	}
	//quantity = quantity*(1000000000000000000);
	var rawTx = txutils.functionTx(abiDefinition, 'transfer', [receiverAddress,quantity], txOptions);
	
	//var rawTx = txutils.functionTx(abiDefinition, 'transferComodity', [receiverName,quantity,receiverAddress], txOptions);
	//console.log(rawTx);

	sendRaw(rawTx, function (Result){
		if(Result){
			console.log("Transfer Ownership Transaction Hash: " + Result);
			flag(Result);
		}
		else{
			flag(0);
		}
	});

	/*setTimeout(function(){
		getDetail(contractAddress);
	}, 60000);*/
}

//Create Ethereum Address
//create account using sh file
app.get('/createAddress', function (req, res) {
	var sql = "SELECT COUNT(*) AS total_addresses FROM adresses WHERE STATUS = 1";
	connection.query(sql, function (err, newResults) {
		if (err) {
			console.log(err);
        }
        else{
			console.log(newResults[0].total_addresses);
			if(newResults[0].total_addresses<60){

				postToApi.postToApi('generateAddress', [], function(err, body){
					if(err) {
						res.send({'Error':err});
						// flag(0);
					}
					else if (body.status == 2){
						res.send({'message':body.message});
						return ;
					}
					console.log(err);
					console.log(body);
                    var addressStatus = 5;
				console.log('new TESTNET address: '+body.publicKey);
				console.log('Private Key(WIF format): '+body.privateKey);
				var sql = "INSERT INTO adresses (bitcoin, privateKey, status) VALUES ('"+body.publicKey+"', '"+body.privateKey.replace("0x","")+"', '" + addressStatus+ "')";
				console.log(sql);
				connection.query(sql, function (err, newResults) {
					if (err) {
						console.log(err);
					}
					else{
						console.log('new record inserted', newResults);
						res.send( {status:"success", message:'new record inserted'});
					}
				});
			});
			}
			else{
				console.log('nothing to execute addresses');
				res.send('nothing to execute addresses');
			}
		}
	});
});

//Creating Private key for generated address
//transfer amount to newly created account
function transferAmount(address, flag){
	//address = '0x3d4a10b2ff1b84a6a47665e71e13002f950b4c1f';
	from_address='0x60e336e6f76533af874a832b47550fadff2073de';
	key='58de7e91126382ef887315691c0f8732ae8c4dcfa88296fd93c69a503f3beffb';
	var returnFlag = 0;
	var rawTx1 = { 
		'nonce': web3.toHex(web3.eth.getTransactionCount(from_address)), 
		'gasPrice': web3.toHex(20000000000), 
		'gasLimit': web3.toHex(800000),
		'from': from_address, 
		'to': address, 
		'data': '0x' + byteCode, 
		value: web3.toHex(1000000000000000000)
	}  
	
	sendRaw(rawTx1, function (Result){
		console.log("Transaction Hash"+Result);
		if(Result){
			returnFlag = 1;
			flag(returnFlag);
		}
		else{
			flag(returnFlag);
		}
	});
}

//generating private key for an address
app.get('/generateKey', function (req, res) {
	var pk = 'N/A';
	var newpk = 'n/a';
	var stat = 5;
	var sql = "SELECT *FROM adresses WHERE (privatekey = '"+pk+"' OR privatekey = '"+newpk+"') AND status = "+stat+" ORDER BY id ASC LIMIT 1";
	connection.query(sql, function (err, newResults) {
		if (err) {
			console.log(err);
		}
		else{
			if(newResults.length > 0){
				address = newResults[0].bitcoin;
				keygeneration(address, function (returnResult){
					key = returnResult;
					pkStatus = 1;
					console.log('Key: ' + key);
					var sql = "UPDATE adresses set privatekey = '"+key+"', status = "+pkStatus+" WHERE bitcoin = '"+address+"'";
					connection.query(sql, function (err, newResults) {
						if (err) {
							console.log(err);
						}
						else{
							transferAmount(address, function(returnRes){
								if(returnRes){
									console.log('Result: ' + returnRes);
									data = {
										"Success":"Record update"
									};
									console.log(data);
									res.send(data);
								}
								else{
									data = {
										"Error":"something went wrong"
									};
									console.log(data);
									res.send(data);
								}
							});
						}
					});
				});
			}
			else{
				data = {
					"Error":"nothing to execute generateKey"
				};
				console.log(data);
				res.send(data);
			}
		}
	});
});

function keygeneration(data , flag){
    try {
		if(data){
            var address= data;
            var keyobj=keyth.importFromFile(address,path_to_keys)
            var privateKey=keyth.recover(unlockPassword,keyobj);
            var pkey= privateKey.toString('hex');
            flag(pkey);
		}
    }
	catch (ex){
        console.log('Exception Arise: ' + ex);
    }
}

function sendRaw(rawTx,flag) {
	var privateKey = new Buffer(key, 'hex');
	var transaction = new tx(rawTx);
	transaction.sign(privateKey);
	var serializedTx = transaction.serialize().toString('hex');
	web3.eth.sendRawTransaction(
	'0x' + serializedTx, function(err, result) {
		if(err) {
			console.log(err);
			flag(err);
		} else {
			//console.log(result);
			flag(result);
		}
	});
}
/////////////////////////////////////get total tokens///////////////////////////////////////

app.post('/getTotalTokens', function (req, res){
    var postData = '';
    var bitcoinAddress = privateKey = '';
    var data=username =password=hashkey= '';
    var ammount=0;

    req.on('data', function (data) {
        postData  = data;
    });
    req.on('end', function () {
        postData = JSON.parse(postData);
        
        if (!(postData.username) ||
            !(postData.hashkey)|| !(postData.password) ||!(postData.BlockChainAddress)) {
            console.log('ER0002: You have not provided all the mandatory details.');
            res.send('{"errorcode":"ER0002","message":"You have not provided all the mandatory details."}');
        }
        else {
            username = postData.username;
            password = md5(postData.password);
            hashkey = postData.hashkey;
            bitcoinAddress = postData.BlockChainAddress;
            var ip='';
            console.log('Input for /getTotalAssets method is username: ' + username + ', password: ' + password + ', hashkey: ' + hashkey + ', bitcoinAddress: ' + bitcoinAddress);
            
            verify(username, password, hashkey, ip, function (id) {
                if(id == 0){
                    console.log('ER0003: Request unauthorized.');
                    res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');
                }
                else{}
            })
        }
    });
    process.on('uncaughtException', function(err) {
        console.log('Error: ' + err);
        //res.send(err);
    });
})

/////////////////////////////////////get total tokens Ethereum version///////////////////////////////////////
app.post('/getTotalAssets', function (req, res){
    var postData = '';
    var bitcoinAddress = privateKey = '';
    var data=username =password=hashkey= '';
    var ammount=0;
    
    req.on('data', function (data) {
        postData  = data;
    });
    req.on('end', function () {
        postData = JSON.parse(postData);
        
        if (!(postData.username) ||
            !(postData.hashkey)|| !(postData.password) ||!(postData.BlockChainAddress)) {
            console.log('ER0002: You have not provided all the mandatory details.');
            res.send('{"errorcode":"ER0002","message":"You have not provided all the mandatory details."}');
        }
        else {
            username = postData.username;
            password = md5(postData.password);
            hashkey = postData.hashkey;
            bitcoinAddress = postData.BlockChainAddress;
            var ip='';
            //console.log('Input for /getTotalAssets method is username: ' + username + ', password: ' + password + ', hashkey: ' + hashkey + ', bitcoinAddress: ' + bitcoinAddress);
            
            verify(username, password, hashkey, ip, function (id) 
            {
                if(id == 0)
                {
                    console.log('ER0003: Request unauthorized.');
                    res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');
                }
                else
                {
					var sql = "SELECT Bitcoin_address AS Bitcoin_address FROM users WHERE Bitcoin_address ='" + postData.BlockChainAddress + "' ";
					console.log(sql);
                    connection.query(sql, function (err, rows,fields) 
                    {
						if (err)
                        {
							console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
							res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
						}
						else 
                        {
                            if(rows.length>0)
                            {
                                countTotalAssets(rows[0].Bitcoin_address , function (Result)
                                {
                                        data = 
                                        {
                                            "TotalAssets" : Result
                                        }
                                        res.send(data);
                                
                                
							     });

                                 //countTotalAssets(rows[0].Bitcoin_address);
                            }
                            else
                            {
                                var sql2 = "SELECT BitcoinAddress AS Bitcoin_address FROM client WHERE BitcoinAddress ='" + postData.BlockChainAddress + "' ";
                                console.log(sql2);
                                connection.query(sql2, function (err, rows,fields) 
                                {
                                    if (err)
                                    {
                                        console.log('ER0002: We are unable to process your request due to an internal error, please contact our customer care for further details.');
                                        res.send('{"errorcode":"ER0002","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
                                    }
                                    else 
                                    {
                                        if(rows.length>0)
                                        {
                                            countTotalAssets(rows[0].Bitcoin_address , function (Result)
                                            {
                                                data = 
                                                {
                                                    "TotalAssets" : Result
                                                }
                                                res.send(data);                                
                                            });
                                        //countTotalAssets(rows[0].Bitcoin_address);
                                        }
                                        else
                                        {
                                            data = 
                                            {
                                                "TotalAssets" : "0"
                                            }
                                            res.send(data);
                                        }
                            
                                    }
                            
                        
                                }) 
                            }
							
                        }
							
						
					}) 
				}
			})
		}
	});
	process.on('uncaughtException', function(err) {
		console.log('Error: ' + err);
		//res.send(err);
	});
})

function countTotalAssets(bitcoinAddress,flag){ 
	var totalTokens=0;
	var sql = "SELECT  AssetId FROM assets WHERE Status='SUCCESS'";
	connection.query(sql, function (err, rows,fields) {
		if (err){
			console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
			res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
		}
		else {
			var contract = web3.eth.contract(abiDefinition);
            for (var i = 0; i < rows.length; i++){
				var instance = contract.at(rows[i].AssetId); 
				var data = instance.balanceOf.call(bitcoinAddress);
				if(data>0){
					totalTokens += Number(data);
				}
			}
			console.log(totalTokens);
			flag(totalTokens);
		}
	}) 
}

/////////////////////////////////GetAddressHoldingDetails Ethereum version////////////////////////////////////////////
app.post('/getCurrentHoldingDetails', function (req, res) {
    var postData = '';
    var bitcoinAddress = privateKey = '';
    var data = username = password = hashkey = '';
    var ammount = 0;
    var contractadd = [];
    var tokens =[];
    var id =[];

    req.on('data', function (data) {
		postData = data;
    });
    req.on('end', function (){
        postData = JSON.parse(postData);
		if (!(postData.username) || !(postData.hashkey) || !(postData.password) || !(postData.BlockChainAddress)) {
            console.log('ER0002: You have not provided all the mandatory details.');
            res.send('{"errorcode":"ER0002","message":"You have not provided all the mandatory details."}');
        }
		else {
            username = postData.username;
            password = md5(postData.password);
            hashkey = postData.hashkey;
            bitcoinAddress = postData.BlockChainAddress;
            var ip='';
            //console.log('Input for /getTotalAssets method is username: ' + username + ', password: ' + password + ', hashkey: ' + hashkey + ', bitcoinAddress: ' + bitcoinAddress);
            verify(username, password, hashkey, ip, function (id) {
                if(id == 0)
                {
                    console.log('ER0003: Request unauthorized.');
                    res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');
                }
                else
                {

                    var sql = "SELECT Bitcoin_address AS Bitcoin_address FROM users WHERE Bitcoin_address ='" + postData.BlockChainAddress + "' ";
                    //console.log(sql);
                    connection.query(sql, function (err, rows,fields) 
                    {
                        if (err)
                        {
                            console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
                            res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
                        }
                        else 
                        {
                            if(rows.length>0)
                            {
                                getholding(rows[0].Bitcoin_address , function (Result)
                                {
                                        
                                        res.send(Result);
                                
                                
                                 });

                                 //countTotalAssets(rows[0].Bitcoin_address);
                            }
                            else
                            {
                                var sql2 = "SELECT BitcoinAddress AS Bitcoin_address FROM client WHERE BitcoinAddress ='" + postData.BlockChainAddress + "' ";
                                //console.log(sql2);
                                connection.query(sql2, function (err, rows,fields) 
                                {
                                    if (err)
                                    {
                                        console.log('ER0002: We are unable to process your request due to an internal error, please contact our customer care for further details.');
                                        res.send('{"errorcode":"ER0002","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
                                    }
                                    else 
                                    {
                                        if(rows.length>0)
                                        {
                                            getholding(rows[0].Bitcoin_address , function (Result)
                                            {
                                                
                                                res.send(Result);                                
                                            });
                                        //countTotalAssets(rows[0].Bitcoin_address);
                                        }
                                        else
                                        {
                                            var error= [];
											error.push
											({
													"ER0004": 'No asset found'
											});
                                            res.send(error);
											console.log(error);
                                        }
                            
                                    }
                            
                        
                                }) 
                            }
                            
                        }
                            
                        
                    }) 
					
				}
            })
        }
    })
})

function getholding(bitcoinAddress,flag)
{
    var sql = "SELECT AssetId FROM assets WHERE  Status='SUCCESS'";
    connection.query(sql, function (err, rows,fields) 
    {
        if (err)
        {
            console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
            res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
        }
        else
        {
            if(rows.length <= 0)
            {
				var error= [];
                error.push
                ({
                    "ER0004": 'No asset found'
                });
                //console.log(data);
                flag(error);
            }
            else
            {
				var count=0;
                var display= [];
                var contract = web3.eth.contract(abiDefinition);
                for (var i = 0; i < rows.length; i++)
                {
                    var instance = contract.at(rows[i].AssetId); 
                    var executionid = instance.getExecutionid.call().toString();                               
                    //console.log("ExecutionId:" ,executionid);
                    var data = instance.balanceOf.call(bitcoinAddress).toString();
					var amount = parseInt(data);
                    //console.log("Amount:" , amount);
					
                    if(amount>0)
                    {
                        display.push({
                                "executionid": executionid,
                                "amount": amount
                                    });
						count++;
                    }
                }
				/*if(count==0){
					display.push({
						"ER0004": 'No asset found'
					});
				}*/
                //console.log(display);
                                //res.send(display);
                flag(display);
            }
        }
    }) 
}


app.post('/getBlockDetails', function (req, res){
	var postData = userData = userprivateSeed = '';

    var username = password = hashkey = ip = ExecutionId="";
    req.on('data', function (data) {
        postData = data;
    });

    req.on('end', function () {
        try {
            postData = JSON.parse(postData);
            username = postData.username;
            password =md5(postData.password);
            hashkey = postData.hashkey;
            ExecutionId = postData.ExecutionId;
            ip="";
			console.log('Input for /getBlockDetails method is username: ' + username + ', password: ' + password + ', hashkey: ' + hashkey + ', ExecutionId: ' + ExecutionId);
			
            verify(username, password, hashkey, ip, function (id) {
				response = id;
				if (response == 0){
					console.log('ER0003: Request unauthorized.');
                    res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');
				}
                else {
                    var sql = "SELECT  ExecutionId,Name,Country,Warehouse,Lotnumber as LotNumber,AccountType,IssueOwner,Producer,ExtRef1,ExtRef2 FROM assets " +
                        "WHERE ExecutionId ='" + postData.ExecutionId + "' and Status='SUCCESS'";
                    
					connection.query(sql, function (err, rows,fields) {
                        if (err){
							console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
							res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
                        }
						else {
                            if(rows==[] || rows==''){
								console.log('ER0011: ExecutionId not exists');
                                res.send('{"errorcode":"ER0011","message":"ExecutionId not exists"}');
							}
                            else {
                                for (var i in rows) {
									console.log('Sending response, ExecutionId' + rows[i]['ExecutionId'] + ', Name: ' + rows[i]['Name'] + ', Country: ' + rows[i]['Country']);
                                    res.send(rows[i])
                                }
                            }
                        }
                    });
                }
            });
        }
        catch (ex){
            console.log('Exception Arise: ' + ex);
        }
    });
});

////////////////////////////////////////////block holding ethereum version////////////////////////////////////
app.post('/getBlockHoldings', function (req, res) {
    var postData = userData = userprivateSeed = '';
    var contractAddress;
    var username = password = hashkey = ip = ExecutionId="";
    var display= [];
	var display2=[];
	var row1=[];
    req.on('data', function (data) {
        postData = data;
    });

    req.on('end', function () {
        try {
            postData = JSON.parse(postData);
            username = postData.username;
            password =md5(postData.password);
            hashkey = postData.hashkey;
            ExecutionId = postData.ExecutionId;
            console.log('Input for /getBlockHoldings method is username: ' + username + ', password: ' + password + ', hashkey: ' + hashkey + ', ExecutionId: ' + ExecutionId);
            
            ip="";
            verify(username, password, hashkey, ip, function (id) {
                response = id;
				if (response == 0) {
                    console.log('ER0003: Request unauthorized.');
                    res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');
                }
                else {
                    var sql = "SELECT AssetId FROM assets " +
                        "WHERE ExecutionId ='" + postData.ExecutionId + "' and Status='SUCCESS'";
                    connection.query(sql, function (err, rows,fields) {
                        if (err) {
                            console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
                            res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
                        }
                        else {
                            if(rows==[] || rows==''){
                                console.log('ER0011: ExecutionId not exists');
                                res.send('{"errorcode":"ER0011","message":"ExecutionId not exists"}');
                            }
                            else{
                                contractAddress= rows[0].AssetId;
                                var contract = web3.eth.contract(abiDefinition);
                                var instance = contract.at(contractAddress);
                                var sql = "SELECT Bitcoin_address AS Bitcoin_address FROM users";
								var sql2 = "SELECT BitcoinAddress AS Bitcoin_address FROM client";
								var row = connection.query(sql);
								//console.log(row);
                                connection.query(sql, function (err, rows,fields) {
									if (err){
										console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
										res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
									}
									else 
                                    {
										connection.query(sql2, function (err, rows2,fields) {
										if (err)
                                        {
										  console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
										  res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
									   }
									   else
									   {
										
										  var address = [];
										  var address2= [];
										  var add = [];
										
										  for (var i = 0; i < rows.length; i++)
                                          {
											address[i] = rows[i].Bitcoin_address;
											
										  }
										
										  for (var i = 0; i < rows2.length; i++)
                                          {
											address2[i] = rows2[i].Bitcoin_address;
										  }
										
										  var addresses = address.concat(address2);
										//console.log(addresses);
										
										for (var i = 0; i < addresses.length; i++)
                                        {
											 var data = instance.balanceOf.call(addresses[i]);
											 var amount = parseInt(data);
											 if(data>0)
											 {
												display.push({
												"address": addresses[i],
												"amount": amount
												});
											}
										}
										
										/*display2.push({											
											"BlockHolders": display
										});
										*/
										
										data1={
												"BlockHolders": display
											}
										console.log(display);
										res.send(data1);
									}
										});
										
									}
								});
							}
                        }
                    });
                }
            });
        }
        catch (ex){
            console.log('Exception Arise: ' + ex);
        }
    })
})

app.post('/getBlockTransactionHistory', function (req, res){
    var postData =flags= '';
    var asset_ids = privateKey = '';
    var data=username =password=hashkey= ExecutionId='';
    var ammount=0;
	var array_display=[];
    req.on('data', function (data) {
        postData  = data;
    });
    req.on('end', function () {
        postData = JSON.parse(postData);
		
        if (!(postData.username) ||
            !(postData.hashkey)|| !(postData.password) ||!(postData.ExecutionId)) {
            console.log('ER0002: You have not provided all the mandatory details.');
			res.send('{"errorcode":"ER0002","message":"You have not provided all the mandatory details."}');
		}
        else {
            username = postData.username;
            password = md5(postData.password);
            hashkey = postData.hashkey;
            ExecutionId = postData.ExecutionId;
            var ip='';
			console.log('Input for /getBlockTransactionHistory method is username: ' + username + ', password: ' + password + ', hashkey: ' + hashkey + ', ExecutionId: ' + ExecutionId);
		
            verify(username, password, hashkey, ip, function (id){
                if (id == 0){
					console.log('ER0003: Request unauthorized.');
					res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');
                } else {

                    var assetId =asset_ids;

                    var sql = "SELECT table2.*,assets.Executionid AS BlockId FROM assets RIGHT JOIN (SELECT transferasset.Id,transfer_relation.amount " +
                        ",transferasset.ExecutionId,transferasset.SenderAddress,transferasset.RecieverAddress as ReceiverAddress," +
                        "transfer_relation.assetId " +
                        "FROM transferasset INNER JOIN  transfer_relation ON (transferasset.Id=transfer_relation.transfer_id)"
                        +" WHERE "+
                   " transferasset.ExecutionId='"+ExecutionId+"'"+
                   " GROUP BY transfer_relation.id)AS table2 ON (assets.AssetId=table2.assetId)";

                    connection.query(sql, function (err, results) {
                        if (err) {
							console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
							res.send('{"ER0001":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
                        }

                        if(results==[] || results==""||results==null) {
							console.log('ER0011: ExecutionId not exists');
							res.send('{"errorcode":"ER0011","message":"ExecutionId not exists"}');
                        }
                        else{
							for(var i in results){
                                array_display.push({"Amount":results[i].amount,"BlockId":results[i].BlockId})
								if(array_display.length==results.length){
									data={
									   "ExecutionId":results[0].ExecutionId,
									   "SenderAddress":results[0].SenderAddress,
									   "ReceiverAddress":results[0].ReceiverAddress,
									   "TransactionDetails":array_display
									}
									console.log('Sending Response, ExecutionId: ' + results[0].ExecutionId + ',SenderAddress: ' + results[0].SenderAddress + ',ReceiverAddress: ' + results[0].ReceiverAddress + ', TransactionDetails: ' + utilLogger.inspect(array_display, false, null));
									res.send(data)
								}
							}
                        }
                    });
                }
            })
        }
    });
})

function verifyReceiver_name(sender_name,flag) {
    try {
        var sql = "SELECT Bitcoin_address,Username, PrivateKey,User_type FROM users WHERE Username='"+sender_name+"' ";
        var flg ;
        connection.query(sql, function (err, results) {
            if (err){
				console.log('Error: ' + err);
            }
            if (results.length > 0) {
                firstResult = results[0];
                if(firstResult.User_type=="superuser"|| firstResult.User_type=="member_IFI"){
                    if (firstResult){
                        flg = 1;
                        flag(flg,firstResult.Bitcoin_address);
                    } 
					else {
                        flg = 0;
						checking();
                    }
                }
                else{
					console.log('ER0003: Request unauthorized');
					flg = 0;
					checking();
                }
            }
            else {
				console.log('ER0003: Request unauthorized');
				flg = 0;
				checking();
            }
        });
		
        function checking(){
            if(flg==0 ) {
                var sqli = "SELECT UID,BitcoinAddress,Type FROM client  WHERE  UID='"+sender_name+"' ";
                connection.query(sqli, function (err, results) {
                    if (err){
                        console.log('Error: ' + err);
                    }
                    if (results.length > 0){
                        firstResult = results[0];
                        if (firstResult.Type == "Client" || firstResult.Type == "Liaison") {
                            if (firstResult) {
                                flg = 1;
                                flag(flg,firstResult.BitcoinAddress);
                            } 
							else {
								flg = 0;
                                flag(flg);
                            }
                        }
                        else {
                            console.log('ER0003: Request unauthorized');
							flg = 0;
                            flag(flg);
                        }

                    }
                    else {
						console.log('ER0003: Request unauthorized');
						flg = 0;
                        flag(flg);
                    }
                });

            }
            else {
                flg = 0;
                flag(flg);
            }
        }
    }
    catch (ex){
		console.log('Exception: ' + ex);
    }
}

app.post('/getUserTransactionHistory', function (req, res){
    var postData = '';
    var asset_ids = privateKey =U_Name= '';
    var data=username =password=hashkey= ExecutionId='';
    var ammount=0;

    req.on('data', function (data) {
        postData  = data;
    });
    req.on('end', function () {
        postData = JSON.parse(postData);
		
        if (!(postData.username) ||
            !(postData.hashkey)|| !(postData.password) ||!(postData.UID)) {
            console.log('ER0002: You have not provided all the mandatory details.');
			res.send('{"errorcode":"ER0002","message":"You have not provided all the mandatory details."}');
        }
        else {
            username = postData.username;
            password = md5(postData.password);
            hashkey = postData.hashkey;
            U_Name = postData.UID;
            var ip='';
			console.log('Input for /getUserTransactionHistory method is username: ' + username + ', password: ' + password + ', hashkey: ' + hashkey + ', U_Name: ' + U_Name);
			
            verify(username, password, hashkey, ip, function (id){
				if (id == 0){
					console.log('ER0003: Request unauthorized.');
					res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');
                } 
				else{
					verifyReceiver_name(U_Name,function(flgg,U_address) {
                        if (flgg == 0){
							console.log('ER0003: Request unauthorized.');
							res.send('{"errorcode":"ER0003","message":"Request unauthorized."}');
                        }
                        else{
							var assetId = asset_ids;
                            var sqlss = "SELECT  transferasset.Id,transferasset.SenderAddress,transferasset.RecieverAddress as ReceiverAddress," +
                                "transferasset.ExecutionId,transfer_relation.amount FROM" +
                                " transferasset,transfer_relation WHERE  transferasset.Id=transfer_relation.transfer_id AND " +
                                "(SenderAddress='"+U_address+"' OR RecieverAddress='"+U_address+"')";
                            
                            connection.query(sqlss, function (err, results) {
                                if (err){
									console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
									lres.send('{"ER0001":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
                                }
                                else {
                                    if (results == [] || results == "" || results == null) {
                                        console.log('ER0014: No History exists');
										res.send('{"errorcode":"ER0014","message":"No History exists"}');
                                    }
                                    else{
										data={
                                            "UserHistory":results
                                        }
										console.log('Sending Response: ' + utilLogger.inspect(data, false, null));
										res.send(data);
                                    }
                                }
                            });
                        }
					});
                }
            });
        }
    });
});

app.post('/newAssetRelationTransaction', function (req, res){
    var resut="";
    var privateSeed="";
	userprivateSeed="";
    try {
		var sql = "SELECT *FROM transfer_relation WHERE status = 'INPROGRESS'";
		connection.query(sql, function (err, myResults){
			if (err){
				console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
				res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
			}
			if (myResults.length > 0) {
				console.log('not okay');
				res.send('not okay');
			}
			else{
				var sql = "SELECT transfer_relation.id,transfer_relation.transfer_id,transfer_relation.assetId,transfer_relation.amount ,transfer_relation.status," +
					"transferasset.SenderAddress,transferasset.ExtRef1,transferasset.ExtRef2,transferasset.ExecutionId,transferasset.SenderPrivatekey,transferasset.RecieverAddress,transfer_relation.A_amount" +
					" FROM transferasset,transfer_relation " +
					"WHERE transferasset.Id=transfer_relation.transfer_id AND transfer_relation.status ='PENDING' ORDER BY id ASC LIMIT 1";
				connection.query(sql, function (err, results){
					if (err){
						console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
						res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
					}
					if (results.length > 0) {
						result = results[0];
						txid = '';
						transferID = result.transfer_id;
						id = result.id;
						setStatus = 'INPROGRESS'
						update_transactionsss(txid,id,transferID,setStatus);
						receiverName = 'Test Baby';
						transferAsset(result.assetId,result.SenderAddress,result.SenderPrivatekey,result.RecieverAddress,result.amount,receiverName,function(returnFlag){
							if(returnFlag){
								err = returnFlag.toString();
								if(err){
									err_array = err.split(':');
									if(err_array[0] == 'Error'){
										console.log('Eroorr');
										console.log(err_array);
										update_error_transfer(id,err);
										update_error(transferID,err);
										res.send('error inserted');
									}
									else{
										console.log('transfer done');
										setStatus = 'SUCCESS'
										update_transactionsss(returnFlag,id,transferID,setStatus);
										res.send('transfer done');
									}
								}
								else{
									console.log('transfer done');
									setStatus = 'SUCCESS'
									update_transactionsss(returnFlag,id,transferID,setStatus);
									res.send('transfer done');
								}
							}
							else{
								console.log('nothing to do');
								res.send('nothing to do');
							}
						})
					}
					else{
						console.log('nothing to do');
						res.send('nothing to do');
					}
				});
			}
		});
	}
	catch(ex){
		console.log('Exception: ' + ex);
		console.log('Exception: ' + ex);
	}
});

function update_transactionsss(txid,id,transferID,setStatus){
	try {
		var sqls = "update transfer_relation set status='"+setStatus+"' where id=" + id + "";
		connection.query(sqls, function (err, results) {
			if(err){
				console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
				res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
			}
			if (results) {
				if(txid){
					updateTransferAsset(txid,transferID);
				}
			} 
			else {}
		});
	}
	catch(ex){
		console.log('Exception: ' + ex);
	}
}

function updateTransferAsset(txid,id){
	try {
		var sqls = "update transferasset set Txid='"+(txid)+"' where id=" + id + "";
		connection.query(sqls, function (err, results) {
			if(err){
				console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
				res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
			}
			if (results) { } 
			else { }
		});
	}
	catch(ex){
		console.log('Exception: ' + ex);
	}
}

function update_error(ids,s1){
	try{
		var sqls = "UPDATE transferasset set status='FAILED',Error='"+s1+"',Dev_Status='FAILED' where id=" + ids+ "";
		connection.query(sqls, function (err, results) {
			if(err){
				console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
				res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
			}
			if(results){ } 
			else { }
		});
	}
	catch(ex){ 
		console.log('Exception: ' + ex);
	}
}

function update_error_transfer(ids,s1){
	try{
		var sqls = "UPDATE transfer_relation set error='"+s1+"',status='FAILED' where id=" + ids+ "";
		connection.query(sqls, function (err, results) {
			if(err){
				console.log('ER0001: We are unable to process your request due to an internal error, please contact our customer care for further details.');
				res.send('{"errorcode":"ER0001","message":"We are unable to process your request due to an internal error, please contact our customer care for further details."}');
			}
			if(results){ } 
			else { }
		});
	}
	catch(ex){ 
		console.log('Exception: ' + ex);
	}
}

app.get('/getHold',function(req,res){
	var Colu = require('colu')

	var privateSeed = '337420fcb4614fa5084101c275dda009592d8511dae152a6eaa8d5288d5cda86'
	var assetId = 'LaA1iVvHkSjrvwvT2CTZCTMSkzECRpp5uK236r'
	var addresses = ['mzKewG4Vo9HFqWRjcGpUVgaA1GrH1raP7q','mkvqtc25vKXp7Xf5SqqHVZYU5BAgwTas8B']
	var numConfirmations = 0
	
	var settings = {
		network: 'testnet',
		privateSeed: privateSeed
	}

	var colu = new Colu(settings)
	colu.on('connect', function () {
	  colu.coloredCoins.getStakeHolders(assetId, numConfirmations, function (err, body) {
			if (err) {
				console.error(err)
			}
			console.log("Body: ", body);
			console.log(md5('123456'));
			res.send(body);
		})
	})

	colu.init()
});

var server = app.listen(port, function () {
    console.log("Server is Listening at port "+port+" !!")
});