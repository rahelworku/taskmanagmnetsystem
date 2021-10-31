const mysql = require('mysql');
const express = require('express');
var uuid = require('uuid');
const fileUpload = require('express-fileupload')
var nodemailer = require('nodemailer');
var http = require('http');
var fs = require('fs');
var flash = require('connect-flash');
var dialog = require('dialog');
const console = require('console');
let date_ob = new Date();
var flash = require('express-flash-messages');
const router = require('../router/myrouter');
const e = require('express');
const { getMaxListeners, exit } = require('process');
const { connect, post } = require('../router/myrouter');
const { count, countReset } = require('console');
const { EOL } = require('os');
const { EOF } = require('dns');
const { err } = require('dialog');
const app = express();
app.use(express.static('public/images'));
app.use(flash());

app.use(fileUpload());
const pool = mysql.createPool({

   host: 'localhost',

   connectionLimit: 10000,
   user: 'root',

   password: '',
   database: 'astawash'

});

exports.register = function (req, res) {
   const { userid, fullname, slct, email, } = req.body;
   const password = "sis" + userid;


   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(error);
      } else
         console.log(' database is Connected!:)');

      if (userid == "" || fullname == "" || slct == "" || email == "") {
         console.log("please complete the form");
      }


      else {
         connection.query("SELECT userid from astawash WHERE userid=?", [userid], function (err, rows) {
            if (err) throw err;
            else {


               if (rows != 0) {
                  connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, roww) {
                     if (err) throw err;
                     else {
                        res.render('register', { alert: "alert", roww });

                        console.log('user id already taken');
                     }
                  })


               }
               else {

                  var auserid = userid.split(" ").join("");
                  var apassword = password.split(" ").join("");

                  // Initialize variable

                  // Function call
                  connection.query("INSERT INTO astawash SET userid=?,fullname=?,email=?,jobposition=?,password=?", [auserid, fullname, email, slct, apassword,], function (err, rows) {
                     // connection.release();

                     if (err) {
                        res.end('sorry');
                        throw err

                     }
                     else {
                        console.log('yess smile');
                        console.log(userid, fullname, password, email, slct)
                        var transporter = nodemailer.createTransport({
                           service: 'gmail',
                           auth: {
                              user: 'astawashaau@gmail.com',
                              pass: 'adminadmin123'
                           }
                        });

                        var mailOptions = {
                           from: 'astawashaau@gmail.com',
                           to: email,
                           subject: 'Hello dear staff',
                           text: 'you are registered to Astawash task managment system.your default password is' + " " + apassword + ".Please login and change your password for security purpose."
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                           if (error) {
                              console.log(error);
                           } else {
                              console.log('Email sent: ' + info.response);
                           }
                        });
                        connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, roww) {
                           if (err) throw err;
                           else {
                              res.render('register', { success: "success", roww });

                           }
                        })

                     }


                  })
               }
            }
         })

      }



   }
   );

}
exports.displayloginpage = function (req, res) {
   // res.end('hello');
   res.render('loginpage');
}
exports.authenticate = function (req, res) {
   const { auserid, apassword } = req.body;
   let date = ("0" + date_ob.getDate()).slice(-2);
   //console.count(auserid);

   // current month
   let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
   let year = date_ob.getFullYear();
   // prints date in YYYY-MM-DD format
   var overalldate = year + "-" + month + "-" + date;
   res.cookie("userid", auserid);
   pool.getConnection(function (error, connections) {
      if (error) {
         throw error;
      }
      else {
         connections.query('SELECT * FROM astawash WHERE userid = ? AND password=? ', [auserid, apassword], function (error, results, fields) {
            if (error) {
               console.log('there is an error in the query');
               throw error;
            }
            else {

               if (results.length > 0) {

                  if (apassword == results[0].password) {
                     if (results[0].jobposition == "school head") {
                        connections.query("SELECT * from message,astawash WHERE recipentid=? AND message.senderid=astawash.userid AND seen=1", [auserid], function (err, inbox) {
                           if (err) throw err;
                           else {
                              connections.query("SELECT * FROM report WHERE seen=1", function (err, reports) {
                                 if (err) throw err;
                                 else {
                                    connections.query("SELECT * FROM complain WHERE seen=1", function (err, complains) {

                                       if (err) throw err;
                                       else {
                                          connections.query('UPDATE task SET dlh=? WHERE task.deadlinedate<=? AND  dlh!=? ', [1, overalldate, ""], function (err, deadline) {

                                             if (err) throw err;
                                             else {

                                                connections.query('SELECT * FROM task,astawash WHERE task.deadlinedate<=? AND task.staffid=astawash.userid AND dlh=? ', [overalldate, 1], function (err, deadline) {
                                                   if (err) throw err;
                                                   else {
                                                      connections.query('SELECT * from deletedtask WHERE head=1', function (err, deletedtask) {
                                                         if (err) throw err;
                                                         else {
                                                            connections.query("SELECT * FROM task,astawash WHERE task.staffid=astawash.userid AND sh=? ", [1], function (err, tasks) {
                                                               if (err) throw err;
                                                               else {
                                                                  connections.query("SELECT * FROM announce WHERE sh=?", ["1"], function (err, ann) {
                                                                     if (err) throw err;
                                                                     else {
                                                                        connections.query("SELECT * FROM deadlinechanges WHERE sh=?", ["1"], function (err, dc) {
                                                                           if (err) throw err;
                                                                           else {
                                                                              var deleted = deletedtask.length;
                                                                              var deadlines = deadline.length;
                                                                              console.log(deadline + "tasks");

                                                                              var report = reports.length;
                                                                              var dcc = dc.length;
                                                                              var complain = complains.length;
                                                                              var announce = ann.length;
                                                                              console.log(announce);

                                                                              var inboxlength = inbox.length;
                                                                              var taskslength = tasks.length;
                                                                              //   console.log(inboxlength)
                                                                              res.render('landing', { title: 'User List', results, inboxlength, auserid, report, complain, deadlines, deleted, taskslength, announce, dcc });
                                                                              console.log('authenticated succesfully');
                                                                              const user = {
                                                                                 id: results[0].userid
                                                                              }
                                                                              res.cookie("user", user);


                                                                           }
                                                                        })


                                                                     }
                                                                  })
                                                               }



                                                            })

                                                         }
                                                      })

                                                   }
                                                })

                                             }
                                          })

                                       }
                                    })

                                 }
                              })

                           }
                        })


                     }
                     else {
                        if (results[0].password == "sis" + auserid) {
                           pool.getConnection(function (error, connection) {
                              if (error) {
                                 console.log(' not successful');
                              }
                              else {
                                 connection.query("SELECT * from astawash WHERE userid=?", [auserid], function (err, rows) {
                                    if (err) throw err;
                                    else {
                                       connection.query("SELECT * from message WHERE recipentid=?", [auserid], function (err, inbox) {
                                          if (err) throw err;
                                          else {

                                          }
                                       })
                                       res.render('update1', { title: 'User List', rows })

                                    }
                                 })
                              }

                           })
                        }
                        else {
                           connections.query("SELECT * from message,astawash WHERE recipentid=? AND message.senderid=astawash.userid AND seen=1", [auserid], function (err, inbox) {
                              if (err) throw err;
                              else {
                                 connections.query('SELECT * FROM requestreport,task  WHERE requestreport.taskid=task.taskid  AND task.staffid=? AND requestreport.seen=?', [auserid, 1], function (err, reportrequest) {
                                    if (err) throw err;
                                    else {
                                       connections.query("UPDATE task SET dls=? WHERE task.deadlinedate<=? AND task.staffid=? AND dls!=?", [1, overalldate, auserid, ""], function (err) {
                                          if (err) throw err;
                                          else {
                                             connections.query("SELECT * FROM task,astawash WHERE task.deadlinedate<=? AND astawash.userid=task.staffid AND task.staffid=? AND dls=?", [overalldate, auserid, 1], function (err, dead) {
                                                if (err) throw err;
                                                else {
                                                   connections.query("SELECT * FROM task,astawash WHERE task.staffid=? AND tasktype=? AND astawash.userid=task.staffid AND task.ss=?  ", [auserid, "individual", "1"], function (err, mytasks) {
                                                      if (err) throw err;
                                                      else {
                                                         connections.query("SELECT * FROM groups,task WHERE  groups.staffid=? AND groups.taskid=task.taskid AND tasktype=? AND groups.seen=?", [auserid, "Group", 1], function (err, group) {
                                                            if (err) throw err;
                                                            else {
                                                               connections.query("SELECT * FROM deletedtask WHERE deletedtask.staffid=?  AND staff=?", [auserid, "1"], function (err, deleted) {
                                                                  if (err) throw err;
                                                                  else {
                                                                     connections.query("SELECT * FROM announce", function (err, ann) {
                                                                        if (err) throw err;
                                                                        else {
                                                                           connections.query("SELECT * FROM deadlinechanges,task WHERE deadlinechanges.taskid=task.taskid AND task.staffid=?  AND ssh=? ORDER BY rollno DESC", [auserid, "1"], function (err, dc) {
                                                                              if (err) throw err;
                                                                              else {
                                                                                 var dcc = dc.length;
                                                                                 console.log(dead);
                                                                                 console.log(group);
                                                                                 var announce = ann.length;
                                                                                 deletedtask = deleted.length;

                                                                                 mytasklist = mytasks.length;
                                                                                 deadline = dead.length;
                                                                                 grouptask = group.length;
                                                                                 inboxs = inbox.length;
                                                                                 reportrequests = reportrequest.length;
                                                                                 res.render('landing2', { title: 'User List', results, inboxs, reportrequests, deadline, mytasklist, grouptask, deletedtask, announce, dcc });

                                                                                 console.log('authenticated succesfully');
                                                                                 console.log(deletedtask)
                                                                                 const user = {
                                                                                    id: results[0].userid
                                                                                 }
                                                                                 res.cookie("user", user);


                                                                              }

                                                                           })


                                                                        }
                                                                     })

                                                                  }

                                                               })

                                                            }
                                                         })



                                                      }
                                                   })


                                                }
                                             })

                                          }
                                       })


                                    }

                                 })


                              }
                           })


                        }
                     }
                  }
               }
               else {
                  res.render('loginpage', { alert: "information mismatch" });
                  console.log("enter the correct information please");
               }
            }

         })
      }


   })
}
exports.displaycompose = function (req, res) {
   pool.getConnection(function (error, connections) {
      if (error) {
         throw error;
      }
      else {
         connections.query('SELECT * from astawash WHERE userid=?', [req.params.userid], function (err, rows) {
            if (err) throw err;
            else {
               connections.query("SELECT * FROM astawash", function (err, results) {
                  if (err) throw err;
                  else {
                     console.log(results);
                     res.render('compose', { results, rows })

                  }

               })
            }
         })
      }
   })
}
exports.assignform = function (req, res) {
   pool.getConnection(function (error, connections) {
      if (error) {
         throw error;
      }
      else {
         connections.query('SELECT * from astawash WHERE userid=?', [req.params.userid], function (err, rows) {
            if (err) throw err;
            else {
               connections.query("SELECT * FROM astawash ", function (err, results) {
                  if (err) {
                     throw err;
                  }
                  else {
                     res.render('assign', { results, rows })

                  }
               })

            }
         })
      }
   })
}
exports.assign = function (req, res) {
   const users = req.cookies.user;
   const userid = users.id;
   console.log(userid);
   const { recieverid, tasktitle, deadline, description, image } = req.body;
   let date = ("0" + date_ob.getDate()).slice(-2);
   let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
   let year = date_ob.getFullYear();
   let hours = date_ob.getHours();
   let minutes = date_ob.getMinutes();
   let seconds = date_ob.getSeconds();

   // prints date & time in YYYY-MM-DD HH:MM:SS format
   var overalldate = month + "-" + date + "-" + year + " " + hours + ":" + minutes + ":" + seconds;

   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         if (recieverid == "") {
            console.log("please enter recieverid");

         }
         else if (tasktitle == "") {
            console.log("please enter tasktitle");
         }
         else if (description == "") {
            console.log("enter task description to make it easy for your staff member to understand the task")
         }
         else if (deadline == "") {
            console.log("choose task deadline date please");
         }
         else {
            if (req.files) {
               console.log(req.files);
               var file = req.files.image;
               var filename = file.name;
               console.log(filename);
               var uuidname = uuid.v1(); // this is used for unique file name;
               var imgsrc = uuidname + file.name;


               if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif" || file.mimetype == "application/pdf" || file.mimetype == "text/plain" || file.mimetype == "application/vnd.openxmlformats-officedocument.presentationml.presentation" || file.mimetype == "application/vnd.ms-excel" || file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.mimetype == "application/x-zip-compressed") {

                  file.mv('public/docs/' + uuidname + file.name);
                  console.log(file.mimetype);
                  connection.query('SELECT userid,email FROM astawash WHERE userid=? ', [recieverid], function (err, rows) {
                     if (err) throw err;
                     if (rows.length > 0) {
                        connection.query('INSERT INTO task SET staffid=?,assigndate=?,deadlinedate=?,description=?,file=?,filetype=?,tasktitle=?,tasktype=?,dlh=?,sh=?,dls=?,ss=?', [recieverid, overalldate, deadline, description, imgsrc, file.mimetype, tasktitle, 'individual', overalldate, 1, overalldate, 1], function (err) {
                           if (err) throw err;

                           else {
                              var email = rows[0].email;
                              console.log("task assigned succesfully" + rows[0]);
                              var transporter = nodemailer.createTransport({
                                 service: 'gmail',
                                 auth: {
                                    user: 'astawashaau@gmail.com',
                                    pass: 'adminadmin123'
                                 }
                              });

                              var mailOptions = {
                                 from: 'astawashaau@gmail.com',
                                 to: email,
                                 subject: 'Hello dear staff',
                                 text: 'you have been assigned a task.please go and check your Astawash Account to get detailed information'
                              };

                              transporter.sendMail(mailOptions, function (error, info) {
                                 if (error) {
                                    //     console.log(error);
                                    //  connection.query("SELECT * FROM astawash", function (err, results) {
                                    //    if (err) throw err;
                                    //    else {
                                    // res.render('assign', { results, emailfailed: "emailfailed" ,error});
                                    console.log('error happens');
                                    console.log(error);

                                    //   }
                                    //  })
                                 }
                                 else {
                                    console.log('Email sent: ' + info.response);

                                 }

                              });


                           }

                           connection.query("SELECT * FROM astawash", function (err, results) {
                              if (err) throw err;
                              else {
                                 connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, rows) {
                                    if (err) throw err;
                                    else {
                                       console.log(rows);
                                       res.render('assign', { results, rows, success: "success" });
                                       //  console.log('Email sent: ' + info.response);
                                    }
                                 })



                              }

                           })

                        })
                     }

                  })
               }
               else {
                  console.log('format not supported');
                  connection.query("SELECT * FROM astawash", function (err, results) {
                     if (err) throw err;
                     else {
                        connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, rows) {
                           if (err) throw err;
                           else {
                              res.render('assign', { results, format: "format", rows });
                              console.log(file.mimetype);
                           }

                        })



                     }
                  })

               }
            }
            else {
               connection.query('SELECT userid,email FROM astawash WHERE userid=? ', [recieverid], function (err, rows) {
                  console.log(rows);
                  if (err) throw err;
                  if (rows.length > 0) {
                     connection.query('INSERT INTO task SET staffid=?,assigndate=?,deadlinedate=?,description=?,tasktitle=?,tasktype=?,dlh=?,sh=?,dls=?,ss=?', [recieverid, overalldate, deadline, description, tasktitle, 'individual', overalldate, 1, overalldate, 1], function (err) {
                        if (err) throw err;
                        else {
                           var email = rows[0].email;
                           console.log("task assigned succesfully" + rows[0]);
                           var transporter = nodemailer.createTransport({
                              service: 'gmail',
                              auth: {
                                 user: 'astawashaau@gmail.com',
                                 pass: 'adminadmin123'
                              }
                           });

                           var mailOptions = {
                              from: 'astawashaau@gmail.com',
                              to: email,
                              subject: 'Hello dear staff',
                              text: 'you have been assigned a task.please go and check your Astawash Account to get detailed information'
                           };

                           transporter.sendMail(mailOptions, function (error, info) {
                              if (error) {
                                 console.log(error);
                              } else {
                                 console.log('Email sent: ' + info.response);


                              }
                           });
                        }
                        connection.query("SELECT * FROM astawash", function (err, results) {
                           if (err) throw err;
                           else {
                              connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, rows) {
                                 if (err) throw err;
                                 else {
                                    res.render('assign', { results, success: "success", rows });

                                 }
                              })

                           }
                        })

                     })
                  }
                  else {
                     connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, rows) {
                        if (err) throw err;
                        else {
                           res.render('assign', { alert: "alert", rows });
                           console.log('staff member id not found.make sure you entered the correct staff member id');

                        }
                     })

                  }
               }

               )


            }
         }

      }
   }



   )

}
exports.displayannounce = function (req, res) {
   // res.end('hello');
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, rows) {
            if (err) throw err;
            else {
               res.render('announcement', { rows });

            }
         })
      }
   })

}
exports.sendmessage = function (req, res) {

   const users = req.cookies.user;
   const userid = users.id;
   console.log(userid);
   const { recieverid, subject, message, images } = req.body;
   let date = ("0" + date_ob.getDate()).slice(-2);
   let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
   let year = date_ob.getFullYear();
   let hours = date_ob.getHours();
   let minutes = date_ob.getMinutes();
   let seconds = date_ob.getSeconds();

   // prints date & time in YYYY-MM-DD HH:MM:SS format
   var overalldate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }

      else {
         console.log('sucess');
         if (recieverid == "") {
            console.log('please enter the message reciver id.');
         }

         else if (message == "") {
            console.log('please enter the message ');
         }
         else {
            if (!req.files) {
               connection.query('SELECT * FROM astawash WHERE userid = ? ', [recieverid], function (error, results, fields) {
                  if (results.length > 0) {
                     connection.query('SELECT * FROM astawash where userid=?', [recieverid], function (err, rows) {
                        connection.query("INSERT INTO message SET recipentid=?,recipentname=?,subject=?,message=?,senderid=?,date=?,seen=?", [recieverid, rows[0].fullname, subject, message, req.params.userid, overalldate, 1], function (err, rows) {
                           if (err) {
                              connection.query('SELECT * from astawash WHERE userid=?', [req.params.userid], function (err, rows) {
                                 if (err) throw err;
                                 else {
                                    connection.query("SELECT * from astawash ", function (err, results) {
                                       if (err) throw err;
                                       else {
                                          res.render('compose', { error: "error", rows, results });

                                       }
                                    })

                                 }

                              })

                           }
                           else {
                              connection.query('SELECT * FROM astawash WHERE userid=?', [req.params.userid], function (err, rows) {
                                 if (err) throw err;
                                 else {
                                    connection.query("SELECT * from astawash ", function (err, results) {
                                       if (err) throw err;
                                       else {
                                          res.render('compose', { success: "success", rows, results });
                                          console.log('message insertion succesful');
                                       }
                                    })



                                 }

                              })
                           }
                        })
                     })
                  }
                  else {
                     connection.query('SELECT * from astawash WHERE userid=?', [req.params.userid], function (err, rows) {
                        if (err) throw err;
                        else {
                           connection.query("SELECT * from astawash ", function (err, results) {
                              if (err) throw err;
                              else {
                                 res.render('compose', { alert: "alert", rows, results });
                                 console.log('recipent id not found.');

                              }
                           })


                        }
                     })


                  }


               })
            }
            else {
               var file = req.files.images;
               var filename = file.name;
               console.log(filename);
               var uuidname = uuid.v1(); // this is used for unique file name;
               var imgsrc = uuidname + file.name;
               console.log(imgsrc);
               if (file.mimetype == "application/pdf" || file.mimetype == "text/plain" || file.mimetype == "application/vnd.openxmlformats-officedocument.presentationml.presentation" || file.mimetype == "application/vnd.ms-excel" || file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.mimetype == "application/x-zip-compressed") {
                  connection.query('SELECT * FROM astawash WHERE userid = ? ', [recieverid], function (error, results, fields) {
                     if (results.length > 0) {
                        connection.query('SELECT * FROM astawash where userid=?', [recieverid], function (err, rows) {
                           connection.query("INSERT INTO message SET recipentid=?,recipentname=?,subject=?,message=?,senderid=?,date=?,files=?", [recieverid, rows[0].fullname, subject, message, req.params.userid, overalldate, imgsrc], function (err, rows) {
                              if (err) {
                                 connection.query('SELECT * from astawash WHERE userid=?', [req.params.userid], function (err, rows) {
                                    if (err) throw err;
                                    else {
                                       connection.query("SELECT * from astawash ", function (err, results) {
                                          if (err) throw err;
                                          else {
                                             res.render('compose', { error: "error", rows, results });

                                          }
                                       })

                                    }

                                 })

                              }
                              else {
                                 connection.query('SELECT * FROM astawash WHERE userid=?', [req.params.userid], function (err, rows) {
                                    if (err) throw err;
                                    else {
                                       connection.query("SELECT * from astawash ", function (err, results) {
                                          if (err) throw err;
                                          else {
                                             res.render('compose', { success: "success", rows, results });
                                             console.log('message insertion succesful');
                                          }
                                       })



                                    }

                                 })
                              }
                           })
                        })
                     }
                     else {
                        connection.query('SELECT * from astawash WHERE userid=?', [req.params.userid], function (err, rows) {
                           if (err) throw err;
                           else {
                              connection.query("SELECT * from astawash ", function (err, results) {
                                 if (err) throw err;
                                 else {
                                    res.render('compose', { alert: "alert", rows, results });

                                    console.log('recipent id not found.');
                                 }
                              })


                           }
                        })


                     }


                  })
               }
               

               
            }
         }
      }
   })
}

exports.showinbox = function (req, res) {
   const users = req.cookies.user;
   const userid = users.id;
   console.log(userid);

   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {


         console.log('sucess');

         connection.query('SELECT * FROM message,astawash WHERE recipentid=?  AND astawash.userid=message.senderid  ORDER BY messageid DESC', [req.params.userid], function (error, rows) {

            if (error) {
               console.log('error with the query');
               throw error;
            }
            else {
               connection.query("SELECT * from astawash WHERE userid=?", [req.params.userid], function (err, row) {
                  if (err) throw err;
                  else {
                     res.render('inbox', { title: 'User List', rows, row });
                     console.log(rows);
                  }
               })


            }
         })

      }
   })
}
exports.makereportform = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         throw error;
         x
      }
      else {
         connection.query("select * from astawash WHERE userid=?", [req.params.userid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * from task,astawash WHERE task.staffid=astawash.userid AND task.staffid=?", [req.params.userid], function (err, row) {
                  if (err) throw err;
                  else {
                     res.render('makereport', { title: 'User List', rows, row });


                  }
               })

            }
         })
      }
   })
}

exports.staffmembers = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {

         console.log('sucess');
         connection.query('SELECT * FROM astawash', function (error, rows) {
            if (error) {
               console.log('error with the query');
               throw error;
            }
            else {
               //   connection.query("SELECT * FROM astawash WHERE")
               connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, rowss) {
                  if (err) throw err;
                  else {
                     res.render('staffmembers', { title: 'User List', rows, rowss });

                  }
               })
            }

         })

      }
   })
}

exports.download = function (req, res) {
   console.log(req.params.file);
   res.download('public/docs/' + req.params.file);

}
exports.sent = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         const users = req.cookies.user;
         const userid = users.id;
         connection.query('SELECT * FROM message,astawash WHERE senderid=? AND message.senderid=astawash.userid ORDER BY messageid DESC', [req.params.userid], function (error, rows) {
            if (error) {
               console.log('error with the query');
               throw error;
            }
            else {
               connection.query("SELECT * FROM astawash WHERE userid=?", [req.params.userid], function (err, row) {
                  if (err) throw err;
                  else {
                     console.log(rows);
                     res.render('sent', { title: 'User List', rows, row });
                  }
               })

            }
         })
      }
   })
}
exports.announce = function (req, res) {
   const { title, sub, message } = req.body;
   let date = ("0" + date_ob.getDate()).slice(-2);

   // current month
   let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
   let year = date_ob.getFullYear();
   let hours = date_ob.getHours();
   let minutes = date_ob.getMinutes();
   let seconds = date_ob.getSeconds();
   // prints date in YYYY-MM-DD format
   var overalldate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         if (title == "" || sub == "" || message == "") {
            console.log("please complete all necessary informations")
         }
         else {
            connection.query("INSERT INTO announce SET title=?,date=?,announcement=?,subject=?,sh=?,ss=?", [title, overalldate, message, sub, 1, 1], function (err, rows) {
               if (err) {
                  console.log("problem in the query");
                  throw err;
               }
               else {
                  connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, rows) {
                     if (err) throw err;
                     else {
                        console.log('announcement succesful');
                        res.render('announcement', { success: "success", rows });
                     }
                  })

               }

            })
         }
      }



   })
}
exports.deleteuser = function (req, res) {

   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * FROM astawash WHERE userid=?", [req.params.id], function (err, rows) {

            if (err) {

               throw err;

            }

            else {
               if (rows[0].jobposition == "school head") {
                  console.log('you can not delete your account');
                  connection.query("SELECT * FROM astawash", function (err, rows) {
                     if (err) throw err;
                     else {
                        connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, rowss) {
                           if (err) throw err;
                           else {
                              res.render('staffmembers', { alert: "alert", rows, rowss });


                           }
                        })


                     }
                  })

               }
               else if (rows[0].jobposition !== "school head") {
                  connection.query("DELETE from astawash WHERE userid=?", [req.params.id], function (err) {
                     if (err) throw err;
                     else {
                        console.log("deletion operation succesful");

                        connection.query("SELECT * FROM astawash", function (err, rows) {
                           if (err) throw err;
                           else {
                              connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, rowss) {
                                 if (err) throw err;
                                 else {
                                    res.render('staffmembers', { success: "success", rows, rowss });


                                 }
                              })

                           }
                        });
                     }
                  })
               }
               else {
                  connection.query("SELECT * FROM astawash", function (err, rows) {
                     if (err) throw err;
                     else {
                        connection.query("SELECT * from astawash WHERE jobposition=?", ["school head"], function (err, rowss) {
                           if (err) throw err;
                           else {
                              res.render('staffmembers', { success: "success", rows, rowss });


                           }
                        })

                     }
                  })
               }
            }
         });

      };
   })
};
exports.requestreport = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * from task,astawash WHERE task.staffid=astawash.userid", function (err, rows) {
            if (err) {
               throw err;
            }
            else {
               connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, row) {
                  if (err) throw err;
                  else {
                     console.log(rows);
                     res.render('requestreport', { rows, row });
                  }
               })


            }
         });
      }
   });
}
exports.request = function (req, res) {
   const { taskid } = req.body;
   let date = ("0" + date_ob.getDate()).slice(-2);
   let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
   let year = date_ob.getFullYear();
   let hours = date_ob.getHours();
   let minutes = date_ob.getMinutes();
   let seconds = date_ob.getSeconds();
   // prints date & time in YYYY-MM-DD HH:MM:SS format
   var overalldate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * FROM task WHERE taskid=? ", [taskid], function (err, rows) {
            console.log(rows);
            if (rows.length != 0) {
               connection.query("SELECT * FROM  astawash WHERE userid=?", [rows[0].staffid], function (err, results) {
                  if (err) {
                     res.render('requestreport', { error: "error" })

                  }
                  else {
                     if (results.length != 0) {
                        connection.query('INSERT INTO requestreport SET taskid=?,date=?,seen=?', [taskid, overalldate, 1], function (err) {
                           if (err) {
                              res.render('requestreport', { error: "error" })
                           }
                           else {
                              console.log("inserted scuccesfully");
                              connection.query("SELECT * from task,astawash WHERE task.staffid=astawash.userid", function (err, rows) {
                                 if (err) {
                                    throw err;
                                 }
                                 else {
                                    console.log(rows);
                                    connection.query("SELECT * from task,astawash WHERE task.staffid=astawash.userid", function (err, rows) {
                                       if (err) {
                                          throw err;
                                       }
                                       else {
                                          connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, row) {
                                             if (err) throw err;
                                             else {
                                                console.log(rows);
                                                res.render('requestreport', { success: "success", rows, row })
                                             }
                                          })


                                       }
                                    });

                                 }
                              });
                           }
                        })
                     }
                     else {
                        connection.query("SELECT * from task,astawash WHERE task.staffid=astawash.userid", function (err, rows) {
                           if (err) {
                              throw err;
                           }
                           else {
                              connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, row) {
                                 if (err) throw err;
                                 else {
                                    console.log(rows);
                                    res.render("requestreport", { nolonger: "nolonger", rows, row });

                                 }
                              })


                           }
                        });
                     }
                  }
               })

            }
            else {
               connection.query("SELECT * from task,astawash WHERE task.staffid=astawash.userid", function (err, rows) {
                  if (err) {
                     throw err;
                  }
                  else {
                     connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, row) {
                        if (err) throw err;
                        else {
                           console.log(rows);
                           res.render('requestreport', { mismatch: "mismatch", rows, row })
                        }
                     })


                  }
               });
            }
         })


      }
   })
}
exports.complainform = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("select * from astawash where  userid=?", [req.params.userid], function (err, rows) {
            if (err) throw err;
            else {
               res.render('complain', { title: 'User List', rows })

            }
         })
      }
   })
}
exports.mycomplain = function (req, res) {
   const { complain } = req.body;
   const users = req.cookies.user;
   const userid = users.id;
   let date = ("0" + date_ob.getDate()).slice(-2);
   let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
   let year = date_ob.getFullYear();
   let hours = date_ob.getHours();
   let minutes = date_ob.getMinutes();
   let seconds = date_ob.getSeconds();
   // prints date & time in YYYY-MM-DD HH:MM:SS format
   var overalldate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         if (complain == "") {
            console.log("please enter your complain");
         }
         else {
            connection.query('INSERT INTO complain SET complain=?,staffid=?,date=?,seen=?', [complain, req.params.userid, overalldate, 1], function (err) {
               if (err) throw err;
               console.log('complain sent succesfully');
               connection.query("SELECT * FROM astawash WHERE userid=?", [req.params.userid], function (err, rows) {
                  if (err) throw err;
                  else {
                     res.render('complain', { success: "success", rows });

                  }
               })
            })
         }
      }
   })
}
exports.mytasklist = function (req, res) {
   const users = req.cookies.user;
   const userid = users.id;
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {

         connection.query('SELECT * FROM task WHERE staffid=? AND tasktype=? ORDER BY taskid DESC', [req.params.userid, "individual"], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * FROM astawash WHERE  userid=?", [req.params.userid], function (err, row) {
                  if (err) throw err;
                  else {
                     res.render('individualtasklist', { title: 'User List', rows, row })

                  }
               })
               console.log(rows)
            }

         })
      }
   })
}
exports.makereport = function (req, res) {
   const users = req.cookies.user;

   const userid = users.id;
   const { taskid, tasktitle, datestarted, estimatedtime, problem, solution, next, files } = req.body;
   console.log(req.files);
   let date = ("0" + date_ob.getDate()).slice(-2);
   let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
   let year = date_ob.getFullYear();
   let hours = date_ob.getHours();
   let minutes = date_ob.getMinutes();
   let seconds = date_ob.getSeconds();
   // prints date & time in YYYY-MM-DD HH:MM:SS format
   var overalldate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         console.log('no error');
         if (taskid == "") {
            console.log('please enter taskid');
         }
         else if (tasktitle == "") {
            console.log("please enter tasktitle");
         }
         else if (datestarted == "") {
            console.log("please specify the date you started working");
         }
         else if (next == "") {
            console.log("please enter what is next about this task");
         }
         else {
            if (req.files) {
               var file = req.files.files;
               console.log(file.mimetype);
               if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif" || file.mimetype == "application/pdf" || file.mimetype == "text/plain" || file.mimetype == "application/vnd.openxmlformats-officedocument.presentationml.presentation" || file.mimetype == "application/vnd.ms-excel" || file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.mimetype == "application/x-zip-compressed") {

                  file.mv('public/docs/' + uuidname + file.name);
                  console.log(file.mimetype);
                  var filename = file.name;
                  console.log(filename);
                  var uuidname = uuid.v1(); // this is used for unique file name;
                  var imgsrc = uuidname + file.name;
                  console.log("file attached")
                  connection.query('SELECT * FROM task WHERE taskid=? AND staffid=?', [taskid, req.params.userid], function (err, results) {
                     if (err) {
                        // console.log('error with query');
                        throw err;
                     }
                     else {
                        if (results.length > 0) {
                           console.log(results);
                           connection.query('INSERT INTO report SET taskid=?,tasktitle=?,date=?,estimatedtime=?,problems=?,solution=?,next=?,reportdate=?,staffid=?,files=?,filetype=?,seen=?',
                              [taskid, results[0].tasktitle, datestarted, estimatedtime, problem, solution, next, overalldate, req.params.userid, imgsrc, file.mimetype, 1], function (err, results) {

                                 if (err) {
                                    throw err;
                                 }
                                 else {
                                    console.log('report sent succesfully.')
                                    connection.query('SELECT * from astawash WHERE userid=?', [req.params.userid], function (err, rows) {
                                       if (err) throw err;
                                       else {

                                          connection.query("SELECT * FROM task,astawash WHERE task.staffid=astawash.userid AND task.staffid=?", [req.params.userid], function (err, row) {
                                             if (err) throw err;
                                             else {
                                                res.render('makereport', { success: 'success', rows, row });


                                             }
                                          })


                                       }
                                    })

                                 }

                              });
                        }
                        else {
                           console.log('make sure the Task ID and Task Title you entered are correct and  match please');
                           connection.query('SELECT * from astawash WHERE userid=?', [req.params.userid], function (err, rows) {
                              if (err) throw err;
                              else {
                                 connection.query("SELECT * FROM task,astawash WHERE task.staffid=astawash.userid AND task.staffid=?", [req.params.userid], function (err, row) {
                                    if (err) throw err;
                                    else {
                                       res.render('makereport', { mismatch: 'mismatch', rows, row });


                                    }
                                 })

                              }
                           })
                        }
                     }
                  })
               }
               else {
                  connection.query('SELECT * from astawash WHERE userid=?', [req.params.userid], function (err, rows) {
                     if (err) throw err;
                     else {
                        connection.query("SELECT * FROM task,astawash WHERE task.staffid=astawash.userid AND task.staffid=?", [req.params.userid], function (err, row) {
                           if (err) throw err;
                           else {
                              res.render('makereport', { format: 'format', rows, row });


                           }
                        })


                     }
                  })
               }
            }
            else {
               connection.query('SELECT * FROM task WHERE taskid=? AND staffid=?', [taskid, req.params.userid], function (err, results) {
                  if (err) {
                     // console.log('error with query');
                     throw err;
                  }
                  else {
                     if (results.length > 0) {
                        console.log(results);
                        connection.query('INSERT INTO report SET taskid=?,tasktitle=?,date=?,estimatedtime=?,problems=?,solution=?,next=?,reportdate=?,staffid=?,seen=?',
                           [taskid, results[0].tasktitle, datestarted, estimatedtime, problem, solution, next, overalldate, req.params.userid, 1], function (err, results) {

                              if (err) {
                                 throw err;
                              }
                              else {
                                 console.log('report sent succesfully.');
                                 connection.query('SELECT * from astawash WHERE userid=?', [userid], function (err, rows) {
                                    if (err) throw err;
                                    else {
                                       connection.query("SELECT * FROM task,astawash WHERE task.staffid=astawash.userid AND task.staffid=?", [req.params.userid], function (err, row) {
                                          if (err) throw error;
                                          else {
                                             res.render('makereport', { success: 'sucess', rows, row });


                                          }
                                       })


                                    }
                                 })

                              }

                           });
                     }
                     else {
                        connection.query('SELECT * from astawash WHERE userid=?', [req.params.userid], function (err, rows) {
                           if (err) throw err;
                           else {
                              connection.query("SELECT * FROM task,astawash WHERE task.staffid=astawash.userid AND task.staffid=?", [req.params.userid], function (err, row) {
                                 if (err) throw err;
                                 else {
                                    res.render('makereport', { mismatch: 'mismatch', rows, row });
                                    console.log('make sure the Task ID and Task Title you entered are correct and  match please');


                                 }
                              })



                           }
                        })
                     }
                  }
               })
            }
         }
      }
   })

}
exports.eachtask = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM task WHERE taskid=?', [req.params.taskid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("UPDATE task SET dls=? WHERE taskid=? ", ["", req.params.taskid], function (err) {
                  if (err) throw err;
                  else {
                     res.render('eachtask', { title: 'User List', rows })

                  }
               })

            }
         })
      }
   })
}
exports.myprofile = function (req, res) {
   const users = req.cookies.user;
   const userid = users.id;
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * from astawash WHERE userid=?', [req.params.userid], function (err, rows) {
            if (err) {
               console.log('error in query');
            }
            else {
               connection.query("SELECT * from astawash WHERE jobposition=?", ["school head"], function (err, row) {
                  if (err) throw err;
                  else {
                     res.render('myprofile', { title: 'User List', rows, row })


                  }
               })

            }
         })
      }
   })
}

exports.showannouncement = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM announce ORDER BY annid DESC', function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * FROM astawash WHERE userid=?", [req.params.userid], function (err, row) {
                  if (err) throw err;
                  else {
                     res.render('showannouncement', { title: 'User List', rows, row })



                  }
               })

            }
         })

      }
   })
}
exports.eachannounce = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * from announce WHERE annid=?', [req.params.annid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("UPDATE announce SET sh=? WHERE annid=?", ["", req.params.annid], function (err) {
                  if (err) throw err;
                  else {
                     res.render('eachannounce', { title: 'User List', rows })

                  }
               })

            }
         })
      }
   })
}

exports.eachcomplain = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM complain,astawash WHERE complainid=? AND complain.staffid=astawash.userid', [req.params.complainid], function (err, rows) {
            if (err) throw err;
            else {

               connection.query('UPDATE complain SET seen = ? WHERE complainid=?', ["", req.params.complainid], function (err) {
                  if (err) throw err;
                  else {
                     res.render('eachcomplain', { title: 'User List', rows })

                  }
               })

            }
         })
      }
   })
}
exports.eachmessage = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * FROM message,astawash WHERE messageid=? AND message.senderid=astawash.userid ", [req.params.messageid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query('UPDATE message SET seen = ? WHERE recipentid = ? AND messageid=?', ["", req.params.recipentid, req.params.messageid], function (err) {
                  if (err) throw err;
                  else {
                     res.render('eachmessage', { title: 'User List', rows })

                  }
               })

            }


         })
      }
   })
}
exports.notifyrequest = function (req, res) {
   const users = req.cookies.user;
   const userid = users.id;
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM requestreport,task  WHERE requestreport.taskid=task.taskid  AND task.staffid=? ORDER BY rrid DESC', [req.params.userid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * FROM astawash WHERE userid=? ", [req.params.userid], function (err, roww) {
                  if (err) throw err;
                  else {
                     console.log(rows);
                     res.render('notifyrequest', { title: 'User List', rows, roww })
                  }
               })

            }


         })
      }
   })
}
exports.getalltask = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM task ,astawash WHERE task.staffid=astawash.userid ORDER BY taskid DESC', function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, row) {
                  if (err) throw err;
                  else {
                     res.render('alltasks', { title: 'User List', rows, row })

                  }
               })

            }

         })
      }
   })
}
exports.eachtaskheaddeadline = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM task,astawash WHERE taskid=? AND astawash.userid=task.staffid', [req.params.taskid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("UPDATE task SET dlh=? WHERE taskid=?", ["", req.params.taskid], function (err) {
                  if (err) throw err;
                  else {
                     connection.query("SELECT * FROM astawash,groups WHERE groups.taskid=? AND astawash.userid=groups.staffid ", [req.params.taskid], function (err, groups) {
                        if (err) throw err;
                        else {
                           console.log(groups)
                           // connection.query("SELECT * from astawash ")
                           res.render('eachheaddeadline', { title: 'User List', rows, groups })

                        }
                     })
                  }

               })

            }
         })
      }
   })
}
exports.fileopen = function (req, res) {
   var taskid = req.params.taskid;
   console.log(taskid);
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM task WHERE taskid=?', [taskid], function (err, rows) {
            if (err) throw err;
            console.log(rows[0].filetype);
            var filepath = rows[0].file;
            if (rows[0].filetype == "application/pdf" || rows[0].filetype == "text/plain") {
               var fs = require('fs');

               fs.readFile('public/docs/' + filepath, 'utf8', function (err, data) {

                  if (err) throw err;
                  res.contentType("application/pdf");

                  res.write(data);
                  return res.end();

               });
            }
            else {
               res.render('imagedisplay', { title: 'User List', rows })

            }
         })

      }
   })
}
exports.showcomplain = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM complain,astawash WHERE complain.staffid=astawash.userid ORDER BY complainid DESC ', function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, row) {
                  if (err) throw err;
                  else {
                     res.render('showcomplain', { title: 'User List', rows, row })

                  }
               })
            }

         })
      }
   })
}
exports.deadline = function (req, res) {
   const users = req.cookies.user;
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         let date = ("0" + date_ob.getDate()).slice(-2);

         // current month
         let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
         let year = date_ob.getFullYear();
         // prints date in YYYY-MM-DD format
         var overalldate = year + "-" + month + "-" + date;
         connection.query('UPDATE task SET dlh=? WHERE task.deadlinedate<=? AND  dlh!=? ', [1, overalldate, ""], function (err, deadline) {
            if (err) throw err;
            else {
               connection.query('SELECT * FROM task,astawash WHERE task.deadlinedate<=? AND task.staffid=astawash.userid ORDER BY task.deadlinedate DESC ', [overalldate], function (err, rows) {
                  if (err) throw err;
                  else {
                     connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, row) {
                        if (err) throw err;
                        else {
                           res.render('deadlineforhead', { title: 'User List', rows, row })

                        }
                     })

                  }
               })

            }
         })


      }
   }
   )
}
exports.deadlineforstaff = function (req, res) {
   const users = req.cookies.user;
   const userid = users.id;
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         let date = ("0" + date_ob.getDate()).slice(-2);
         let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
         let year = date_ob.getFullYear();
         var overalldate = year + "-" + month + "-" + date;
         connection.query('SELECT * FROM task,astawash WHERE task.deadlinedate<=? AND task.staffid=?  AND astawash.userid=task.staffid ORDER BY task.deadlinedate DESC ', [overalldate, req.params.userid], function (err, rows) {

            if (err) throw err;
            else {
               connection.query("SELECT * FROM astawash WHERE userid=?", [req.params.userid], function (err, roww) {
                  if (err) throw err;
                  else {
                     res.render('deadlineforstaff', { title: 'User List', rows, roww })


                  }
               })

            }

         })
      }
   })
}
exports.registerform = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, roww) {
            if (err) throw err;
            else {
               console.log(roww);
               res.render('register', { roww });

            }
         })
      }
   });

}
exports.updateform = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * from astawash WHERE userid=?", [req.params.userid], function (err, rows) {
            if (err) throw err;
            else {
               res.render('update', { title: 'User List', rows })

            }
         })
      }

   })
}
exports.update = function (req, res) {
   const users = req.cookies.user;
   const userid = users.id;
   const { newpass, confirm } = req.body;
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }

      else {
         if (error) throw error;
         else {
            if (newpass !== confirm) {
               connection.query('SELECT * FROM astawash WHERE userid=?', [req.params.userid], function (err, rows) {
                  console.log('please insert same password');
                  res.render('update', { mismatch: "mismatch", rows })

               })
            }
            else {
               connection.query('UPDATE astawash SET password = ? WHERE userid = ?', [newpass, req.params.userid], function (err, rows) {
                  if (err) throw err;
                  else {
                     console.log('updated succesfully')
                     connection.query("SELECT * FROM astawash WHERE userid=?", [req.params.userid], function (err, rows) {
                        if (err) {
                           res.render('update', { alert: 'alert', rows })

                        }
                        else {
                           res.render('update', { success: 'success', rows })

                        }
                     })
                  }
               })
            }
         }

      }
   })
}
exports.showreport = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM report,astawash WHERE report.staffid=astawash.userid ORDER BY reportid DESC', function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT  * from astawash WHERE jobposition=? ", ["school head"], function (err, row) {
                  if (err) throw err;
                  else {
                     res.render('showreport', { title: 'User List', rows, row })

                  }
               })


            }
         })
      }
   })
}
exports.eachreport = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM report,astawash ,task WHERE reportid=? AND report.staffid=astawash.userid AND report.taskid=task.taskid', [req.params.reportid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query('UPDATE report SET seen = ? WHERE reportid=?', ["", req.params.reportid], function (err) {
                  if (err) throw err;
                  else {
                     console.log(rows);

                     res.render('eachreport', { title: 'User List', rows })
                  }
               })


            }
         })
      }
   })
}
exports.eachsent = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM message WHERE messageid=?', [req.params.messageid], function (err, rows) {
            if (err) throw err;
            else {
               console.log(rows);

               res.render('eachsent', { title: 'User List', rows })

            }
         })
      }
   })
}
exports.contactus = function (req, res) {
   res.render('contactus');
}
exports.contactussend = function (req, res) {
   const { message, email } = req.body;
   var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
         user: 'astawashaau@gmail.com',
         pass: 'adminadmin123'
      }
   });

   var mailOptions = {
      from: "astawashaau@gmail.com",
      to: 'raheldemissie56@gmail.com',
      text: message + "  " + email,
   };

   transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
         console.log(error);
         res.render('contactus', { error: "error" })
      } else {
         console.log('Email sent: ' + info.response);
         res.render('contactus', { success: "success" },)
      }
   });
}
exports.todaytask = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         let date = ("0" + date_ob.getDate()).slice(-2);

         // current month
         let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
         let year = date_ob.getFullYear();
         // prints date in YYYY-MM-DD format
         var overalldate = year + "-" + month + "-" + date;
         connection.query('SELECT * FROM task,astawash WHERE task.deadlinedate=? AND task.staffid=astawash.userid ORDER BY task.deadlinedate DESC ', [overalldate], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * from astawash WHERE jobposition=?",["school head"],function(err,row){
                  if(err) throw err;
                  else{
                     console.log(rows);
               res.render('deadlineforhead', { title: 'User List', rows,row })

                  }
               })
               

            }
         })
      }
   }
   )
}
exports.showgroupassign = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * from astawash ', function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, roww) {
                  if (err) throw err;
                  else {
                     res.render('groupassign', { title: 'User List', rows, roww })

                  }
               })

            }
         })
      }
   })
}


exports.update1 = function (req, res) {
   const users = req.cookies.user;
   // const userid = users.id;
   const { newpass, confirm } = req.body;
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }

      else {
         if (error) throw error;
         else {
            if (newpass !== confirm) {
               connection.query('SELECT * FROM astawash WHERE userid=?', [req.params.userid], function (err, rows) {
                  console.log('please insert same password');
                  res.render('update1', { mismatch: "mismatch", rows })

               })
            }
            else if (newpass == "sis" + req.params.userid) {
               connection.query('SELECT * FROM astawash WHERE userid=?', [req.params.userid], function (err, rows) {
                  console.log('new password');
                  res.render('update1', { same: "same", rows })

               })
            }
            else {
               connection.query('UPDATE astawash SET password = ? WHERE userid = ?', [newpass, req.params.userid], function (err, rows) {
                  if (err) throw err;
                  else {
                     console.log("sis" + req.params.userid)
                     console.log('updated succesfully')
                     res.render('loginpage', { success: "success" })
                  }
               })
            }
         }

      }
   })
}
exports.taskmanager = function (req, res) {
   let date = ("0" + date_ob.getDate()).slice(-2);

   // current month
   let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
   let year = date_ob.getFullYear();
   // prints date in YYYY-MM-DD format
   var overalldate = year + "-" + month + "-" + date;
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM task,astawash WHERE task.deadlinedate<=? AND task.staffid=astawash.userid ORDER BY task.deadlinedate DESC ', [overalldate], function (err, rows) {
            if (err) throw err;
            else {
               console.log(rows);

               connection.query('UPDATE task SET status=? WHERE task.deadlinedate<=?', ['expired', overalldate], function (err, rew) {

                  if (err) throw err;
                  else {
                     console.log(rew);
                     connection.query("SELECT * from task ORDER BY taskid DESC", function (err, rows) {
                        if (err) throw err;
                        else {
                           connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, row) {
                              if (err) throw err;
                              else {
                                 res.render('taskmanager', { rows, row })

                              }
                           })

                        }

                     })
                  }
               })

            }
         })



      }
   })

}
exports.groupassign = function (req, res) {
   const users = req.cookies.user;
   //  const userid = users.id;
   // console.log(userid);
   const { recieverid, tasktitle, deadline, description, image } = req.body;
   let date = ("0" + date_ob.getDate()).slice(-2);
   let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
   let year = date_ob.getFullYear();
   let hours = date_ob.getHours();
   let minutes = date_ob.getMinutes();
   let seconds = date_ob.getSeconds();

   // prints date & time in YYYY-MM-DD HH:MM:SS format
   var overalldate = month + "-" + date + "-" + year + " " + hours + ":" + minutes + ":" + seconds;

   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         if (recieverid == "") {
            console.log("please enter recieverid");

         }
         else if (tasktitle == "") {
            console.log("please enter tasktitle");
         }
         else if (description == "") {
            console.log("enter task description to make it easy for your staff member to understand the task")
         }
         else if (deadline == "") {
            console.log("choose task deadline date please");
         }
         else {
            if (req.files) {
               console.log(req.files);
               var file = req.files.image;
               var filename = file.name;
               console.log(filename);
               var uuidname = uuid.v1(); // this is used for unique file name;
               var imgsrc = uuidname + file.name;

               if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif" || file.mimetype == "application/pdf" || file.mimetype == "text/plain" || file.mimetype == "application/vnd.openxmlformats-officedocument.presentationml.presentation" || file.mimetype == "application/vnd.ms-excel" || file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.mimetype == "application/x-zip-compressed") {

                  file.mv('public/docs/' + uuidname + file.name);
                  console.log(file.mimetype);
                  connection.query('SELECT userid,email FROM astawash WHERE userid=? ', [recieverid[0]], function (err, rows) {
                     if (err) throw err;
                     if (rows.length > 0) {
                        connection.query('INSERT INTO task SET staffid=?,assigndate=?,deadlinedate=?,description=?,file=?,filetype=?,tasktitle=?,tasktype=?,dlh=?,sh=?,dls=?', [recieverid[0], overalldate, deadline, description, imgsrc, file.mimetype, tasktitle, 'Group', overalldate, 1, overalldate], function (err) {
                           if (err) throw err;

                           else {
                              connection.query("SELECT taskid from task order by taskid desc limit 1;", function (err, rows) {
                                 var num = req.body.recieverid.length;

                                 if (err) {
                                    throw err;
                                 }
                                 else {
                                    for (i = 0; i < num; i++) {

                                       connection.query("INSERT INTO groups SET taskid=?,staffid=?,seen=?", [rows[0].taskid, req.body.recieverid[i], 1], function (err, rows) {
                                          if (err) {
                                             console.log("new")

                                             throw err;
                                             exit();
                                          }
                                          else {
                                             console.log("inserted");
                                             //  console.log(i);
                                             //i++;
                                          }
                                       })

                                    }
                                 }
                              })

                              var email = rows[0].email;
                              console.log("task assigned succesfully" + rows[0]);
                              var transporter = nodemailer.createTransport({
                                 service: 'gmail',
                                 auth: {
                                    user: 'astawashaau@gmail.com',
                                    pass: 'adminadmin123'
                                 }
                              });

                              var mailOptions = {
                                 from: 'astawashaau@gmail.com',
                                 to: email,
                                 subject: 'Hello dear staff',
                                 text: 'you have been assigned a task.please go and check your Astawash Account to get detailed information'
                              };

                              transporter.sendMail(mailOptions, function (error, info) {
                                 if (error) {
                                    console.log(error);
                                 } else {
                                    console.log('Email sent: ' + info.response);


                                 }
                              });

                           }
                           connection.query("SELECT * FROM astawash", function (err, rows) {
                              if (err) throw err;
                              else {
                                 connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, roww) {
                                    if (err) throw err;
                                    else {
                                       res.render('groupassign', { rows, success: "success", roww });

                                    }
                                 })


                              }
                           })




                        })
                     }
                     else {
                        connection.query("SELECT * FROM astawash", function (err, rows) {
                           if (err) throw err;
                           else {
                              connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, roww) {
                                 if (err) throw err;
                                 else {
                                    res.render('groupassign', { rows, alert: "alert", roww });
                                    console.log("staff memberid not found");
                                 }
                              })



                           }
                        })


                     }
                  })
               }
               else {
                  console.log('format not supported');
                  connection.query("SELECT * FROM astawash", function (err, rows) {
                     if (err) throw err;
                     else {
                        connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, roww) {
                           if (err) throw err;
                           else {
                              res.render('groupassign', { rows, format: "format", roww });
                              console.log(file.mimetype);
                           }
                        })



                     }
                  })

               }
            }
            else {
               connection.query('SELECT userid,email FROM astawash WHERE userid=? ', [recieverid[0]], function (err, rows) {
                  console.log(rows);
                  if (err) throw err;
                  if (rows.length > 0) {
                     connection.query('INSERT INTO task SET staffid=?,assigndate=?,deadlinedate=?,description=?,tasktitle=?,tasktype=?,dlh=?,sh=?', [recieverid[0], overalldate, deadline, description, tasktitle, 'Group', overalldate, 1], function (err) {
                        if (err) throw err;
                        else {
                           var num = req.body.recieverid.length;
                           connection.query("SELECT taskid from task order by taskid desc limit 1;", function (err, rows) {
                              if (err) {
                                 throw err;
                              }
                              else {
                                 console.log(rows);
                                 for (i = 0; i < num; i++) {

                                    connection.query("INSERT INTO groups SET taskid=?,staffid=?,seen=?", [rows[0].taskid, req.body.recieverid[i], 1], function (err, rows) {
                                       if (err) {
                                          console.log("new")

                                          throw err;
                                          exit();
                                       }
                                       else {
                                          console.log("inserted");
                                          //  console.log(i);
                                          //i++;
                                       }
                                    })

                                 }
                              }
                           })


                           var email = rows[0].email;
                           console.log("task assigned succesfully" + rows[0]);
                           var transporter = nodemailer.createTransport({
                              service: 'gmail',
                              auth: {
                                 user: 'astawashaau@gmail.com',
                                 pass: 'adminadmin123'
                              }
                           });

                           var mailOptions = {
                              from: 'astawashaau@gmail.com',
                              to: email,
                              subject: 'Hello dear staff',
                              text: 'you have been assigned a task.please go and check your Astawash Account to get detailed information'
                           };

                           transporter.sendMail(mailOptions, function (error, info) {
                              if (error) {
                                 console.log(error);
                              } else {
                                 console.log('Email sent: ' + info.response);


                              }
                           });
                        }


                        connection.query("SELECT * FROM astawash", function (err, rows) {
                           if (err) throw err;
                           else {
                              connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, roww) {
                                 if (err) throw err;
                                 else {
                                    res.render('groupassign', { rows, success: "success", roww });

                                 }
                              })

                           }
                        })



                     })
                  }
                  else {
                     connection.query("SELECT * FROM astawash", function (err, rows) {
                        if (err) throw err;
                        else {
                           connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, roww) {
                              if (err) throw err;
                              else {
                                 res.render('groupassign', { rows, alert: "alert", roww });

                              }
                           })

                        }
                     })

                  }
               }

               )


            }
         }

      }
   }



   )

}
exports.deletetask = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * FROM task WHERE taskid=?", [req.params.taskid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("INSERT into deletedtask  SET taskid=?,staffid=?,tasktitle=?,description=?,assigndate=?,file=?,tasktype=?,deadlinedate=?,head=1,staff=1", [req.params.taskid, rows[0].staffid, rows[0].tasktitle, rows[0].description, rows[0].assigndate, rows[0].file, rows[0].tasktype, rows[0].deadlinedate], function (err) {


                  if (err) throw err;
                  else {
                     connection.query("DELETE from task WHERE taskid=?", [req.params.taskid], function (err) {

                        if (err) throw err;
                        else {
                           console.log(rows);
                           //      var x=rows[0].staffid;
                           connection.query(" DELETE from report WHERE taskid=? ", [req.params.taskid], function (err) {

                              if (err) throw err;
                              else {


                                 connection.query("SELECT * FROM task ORDER BY taskid DESC", function (err, rows) {
                                    if (err) throw err;
                                    else {
                                       connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, row) {
                                          if (err) throw err;
                                          else {
                                             res.render('taskmanager', { rows, alert: "alert", row })


                                          }
                                       })
                                    }
                                 })
                              }
                           })
                        }
                     })
                  }

               })



            }
         })
      }
   })
}
exports.showtaskupdate = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * FROM task WHERE taskid=? ", [req.params.taskid], function (err, rows) {
            if (err) throw err;
            else {

               res.render('updatetask', { rows })
            }
         })
      }
   })
}
exports.updatetask = function (req, res) {
   let date = ("0" + date_ob.getDate()).slice(-2);
   let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
   let year = date_ob.getFullYear();
   let hours = date_ob.getHours();
   let minutes = date_ob.getMinutes();
   let seconds = date_ob.getSeconds();

   // prints date & time in YYYY-MM-DD HH:MM:SS format
   //  var overalldate = month + "-" + date + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
   var overalldate = year + "-" + month + "-" + date;
   const { newdate } = req.body;

   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM task WHERE taskid=?', [req.params.taskid], function (err, rows) {
            if (err) throw err;
            else {
               console.log(rows[0].deadlinedate);
               var x = rows[0].deadlinedate;
               connection.query('UPDATE task SET deadlinedate=? WHERE taskid=?', [newdate, req.params.taskid], function (err, rows) {
                  if (err) throw err;
                  else {
                     connection.query('UPDATE task SET status=? WHERE date(deadlinedate)>? AND taskid=?', ["", overalldate, req.params.taskid], function (err) {
                        if (err) throw err;
                        else {
                           console.log("hello");
                           connection.query('UPDATE task SET status=? WHERE date(deadlinedate)<? AND taskid=?', ["expired", overalldate, req.params.taskid], function (err) {
                              if (err) throw err;
                              else {
                                 connection.query("SELECT * FROM task ORDER BY taskid DESC", function (err, rows) {
                                    if (err) throw err;
                                    else {
                                       connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, row) {
                                          if (err) throw err;
                                          else {
                                             res.render('taskmanager', { rows, update: "updates", row });
                                             connection.query("INSERT INTO deadlinechanges SET taskid=?,date=?,previous=?,now=?,sh=?,ssh=?", [req.params.taskid, overalldate, x, newdate, "1", "1"], function (err) {
                                                if (err) throw err;
                                                else {
                                                   console.log("inserted succesfully");
                                                }
                                             })

                                          }
                                       })


                                    }
                                 })
                              }
                           })


                        }
                     })
                  }
               })
            }
         })
      }
   })
}
exports.deadlinechanges = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * FROM deadlinechanges,task WHERE deadlinechanges.taskid=task.taskid AND task.staffid=?  ORDER BY rollno DESC", [req.params.userid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * FROM astawash WHERE userid=?", [req.params.userid], function (err, row) {
                  if (err) throw err;
                  else {
                     res.render("deadlinechanges2", { rows, row })


                  }
               })
            }
         })
      }
   })
}
exports.deletedtask = function (req, res) {
   console.log(req.params.userid);
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * FROM deletedtask WHERE  deletedtask.staffid=? ORDER BY rollno DESC", [req.params.userid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * FROM astawash WHERE jobposition!=?  AND userid=? ", ["school head", req.params.userid], function (err, roww) {
                  if (err) throw err;
                  else {
                     res.render("deletedtask", { rows, roww })

                  }
               })
            }
         })
      }
   })
}
exports.eachdeletedtask = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * from deletedtask WHERE taskid=?", [req.params.taskid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * FROM groups,astawash WHERE groups.staffid=astawash.userid AND taskid=?", [req.params.taskid], function (err, groups) {
                  if (err) throw err;
                  else {
                     connection.query("UPDATE deletedtask SET staff=?  WHERE taskid=?", ["", req.params.taskid], function (err) {
                        if (err) throw err;
                        else {
                           connection.query("SELECT * FROM deletedtask,astawash WHERE taskid=? AND deletedtask.staffid=astawash.userid ", [req.params.taskid], function (err, full) {
                              if (err) throw err;
                              else {
                                 console.log(groups);
                                 //console.log(rows);
                                 res.render("eachdeletedtask", { rows, groups })
                              }
                           })


                        }
                     })
                  }
               })


            }
         })
      }
   })
}
exports.removedtasks = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * from deletedtask ORDER BY roLlno DESC ", function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, row) {
                  if (err) throw err;
                  else {
                     res.render("deletedtaskforhead", { rows, row })

                  }
               })

            }
         })

      }
   })
}
exports.deadlinechangesforhead = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * from deadlinechanges ORDER BY roLlno DESC ", function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, roww) {
                  if (err) throw err;
                  else {
                     res.render("deadlinechanges", { rows, roww })

                  }
               })

            }
         })

      }
   })
}
exports.eachtaskrequest = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log("not succesful");
      }
      else {
         connection.query('SELECT * FROM task,astawash WHERE taskid=? AND astawash.userid=task.staffid', [req.params.taskid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("UPDATE requestreport SET seen=? WHERE rrid=?", ["", req.params.rrid], function (err) {
                  if (err) throw err;
                  else {
                     res.render("eachtask", { rows });

                  }
               })

            }
         })

      }
   })
}
exports.assignmemberspage = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM task,astawash WHERE tasktype=? AND astawash.userid=task.staffid', ["Group"], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * FROM astawash", function (err, memb) {
                  if (err) throw err;
                  else {
                     console.log(memb);
                     res.render("group", { rows, memb });

                  }
               })

            }
         })

      }
   })
}
exports.mygrouptasklist = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * from task,groups where groups.staffid=? AND groups.taskid=task.taskid ORDER BY groups.roll DESC", [req.params.userid], function (err, rows) {
            if (err) {
               throw err;
            }
            else {
               connection.query("SELECT * FROM astawash WHERE userid=?", [req.params.userid], function (err, row) {
                  if (err) throw err;
                  else {
                     console.log(rows);

                     res.render("grouptasklist", { rows, row })

                  }
               })
            }
         })
      }
   })

}
exports.eachgrouptask = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * from task,astawash WHERE taskid=? AND astawash.userid=task.staffid ", [req.params.taskid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * from groups,astawash WHERE taskid=? AND groups.staffid=astawash.userid", [req.params.taskid], function (err, memb) {
                  if (err) throw err;
                  else {
                     connection.query("UPDATE groups SET seen=? WHERE roll=?", ["", req.params.roll], function (err) {
                        if (err) throw err;
                        else {
                           console.log(rows);
                           res.render("eachgrouptask", { rows, memb });


                        }
                     })

                  }
               })
            }
         })
      }
   })
}
exports.eachtaskhead = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * FROM task,astawash WHERE taskid=? AND task.staffid=astawash.userid", [req.params.taskid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * from groups,astawash WHERE taskid=? AND groups.staffid=astawash.userid", [req.params.taskid], function (err, groups) {
                  if (err) throw err;
                  else {
                     connection.query("UPDATE task SET sh=? WHERE taskid=?", ["", req.params.taskid], function (err) {
                        if (err) throw err;
                        else {
                           console.log(groups);
                           res.render("eachtaskhead", { rows, groups })
                        }
                     })
                  }

               })

            }
         })
      }

   })
}
exports.homeforhead = function (req, res) {
   let date = ("0" + date_ob.getDate()).slice(-2);
   //console.count(auserid);

   // current month
   let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
   let year = date_ob.getFullYear();
   // prints date in YYYY-MM-DD format
   var overalldate = year + "-" + month + "-" + date;
   pool.getConnection(function (error, connections) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connections.query("SELECT * FROM astawash WHERE userid=?", [req.params.userid], function (err, who) {
            if (err) throw err;
            else {
               if (who[0].jobposition == "school head") {
                  connections.query("SELECT * from message,astawash WHERE recipentid=? AND message.senderid=astawash.userid AND seen=1", [req.params.userid], function (err, inbox) {
                     if (err) throw err;
                     else {
                        connections.query("SELECT * FROM report WHERE seen=1", function (err, reports) {
                           if (err) throw err;
                           else {
                              connections.query("SELECT * FROM complain WHERE seen=1", function (err, complains) {

                                 if (err) throw err;
                                 else {
                                    connections.query('UPDATE task SET dlh=? WHERE task.deadlinedate<=? AND  dlh!=? ', [1, overalldate, ""], function (err, deadline) {

                                       if (err) throw err;
                                       else {

                                          connections.query('SELECT * FROM task,astawash WHERE task.deadlinedate<=? AND task.staffid=astawash.userid AND dlh=? ', [overalldate, 1], function (err, deadline) {
                                             if (err) throw err;
                                             else {
                                                connections.query('SELECT * from deletedtask WHERE head=1', function (err, deletedtask) {
                                                   if (err) throw err;
                                                   else {
                                                      connections.query("SELECT * FROM task,astawash WHERE task.staffid=astawash.userid AND sh=? ", [1], function (err, tasks) {
                                                         if (err) throw err;
                                                         else {
                                                            connections.query("SELECT * FROM astawash WHERE userid=?", [req.params.userid], function (err, results) {
                                                               if (err) throw err;
                                                               else {
                                                                  connections.query("SELECT * FROM announce WHERE sh=?", ["1"], function (err, ann) {
                                                                     if (err) throw err;
                                                                     else {
                                                                        connections.query("SELECT * FROM deadlinechanges WHERE sh=?", ["1"], function (err, dc) {
                                                                           if (err) throw err;
                                                                           else {
                                                                              var deadlines = deadline.length;
                                                                              console.log(deadline + "tasks");
                                                                              var deleted = deletedtask.length;
                                                                              var announce = ann.length;


                                                                              var report = reports.length;
                                                                              var complain = complains.length;
                                                                              var auserid = req.params.userid;
                                                                              var dcc = dc.length;

                                                                              var inboxlength = inbox.length;
                                                                              var taskslength = tasks.length;
                                                                              //   console.log(inboxlength)
                                                                              res.render('landing', { title: 'User List', results, inboxlength, auserid, report, complain, deadlines, deleted, taskslength, announce, dcc });
                                                                              console.log('authenticated succesfully');


                                                                           }
                                                                        })

                                                                     }
                                                                  })


                                                               }
                                                            })

                                                         }



                                                      })

                                                   }
                                                })

                                             }
                                          })

                                       }
                                    })

                                 }
                              })

                           }
                        })

                     }
                  })
               }
               else {

                  connections.query("SELECT * from message,astawash WHERE recipentid=? AND message.senderid=astawash.userid AND seen=1", [req.params.userid], function (err, inbox) {
                     if (err) throw err;
                     else {
                        connections.query('SELECT * FROM requestreport,task  WHERE requestreport.taskid=task.taskid  AND task.staffid=? AND requestreport.seen=?', [req.params.userid, 1], function (err, reportrequest) {
                           if (err) throw err;
                           else {
                              connections.query("UPDATE task SET dls=? WHERE task.deadlinedate<=? AND task.staffid=? AND dls!=?", ["1", overalldate, req.params.userid, ""], function (err) {
                                 if (err) throw err;
                                 else {
                                    connections.query("SELECT * FROM task,astawash WHERE task.deadlinedate<=? AND astawash.userid=task.staffid AND task.staffid=? AND dls=?", [overalldate, req.params.userid, 1], function (err, dead) {
                                       if (err) throw err;
                                       else {
                                          connections.query("SELECT * FROM task,astawash WHERE task.staffid=? AND tasktype=? AND astawash.userid=task.staffid AND task.ss=?  ", [req.params.userid, "individual", "1"], function (err, mytasks) {
                                             if (err) throw err;
                                             else {
                                                connections.query("SELECT * FROM groups,task WHERE  groups.staffid=? AND groups.taskid=task.taskid AND tasktype=? AND groups.seen=?", [req.params.userid, "Group", 1], function (err, group) {
                                                   if (err) throw err;
                                                   else {
                                                      connections.query("SELECT * FROM deletedtask WHERE deletedtask.staffid=?  AND staff=?", [req.params.userid, "1"], function (err, deleted) {
                                                         if (err) throw err;
                                                         else {
                                                            connections.query("SELECT * FROM astawash WHERE userid=?", [req.params.userid], function (err, results) {
                                                               if (err) throw err;
                                                               else {
                                                                  connections.query("SELECT * FROM announce", function (err, ann) {
                                                                     if (err) throw err;
                                                                     else {
                                                                        connections.query("SELECT * FROM deadlinechanges,task WHERE deadlinechanges.taskid=task.taskid AND task.staffid=?  AND ssh=? ORDER BY rollno DESC", [req.params.userid, "1"], function (err, dc) {
                                                                           if (err) throw err;
                                                                           else {
                                                                              console.log(dead);
                                                                              console.log(group);
                                                                              deletedtask = deleted.length;
                                                                              announce = ann.length;
                                                                              dcc = dc.length

                                                                              mytasklist = mytasks.length;
                                                                              deadline = dead.length;
                                                                              grouptask = group.length;
                                                                              inboxs = inbox.length;
                                                                              reportrequests = reportrequest.length;
                                                                              res.render('landing2', { title: 'User List', results, inboxs, reportrequests, deadline, mytasklist, grouptask, deletedtask, announce, dcc });

                                                                              console.log('authenticated succesfully');
                                                                              console.log(deletedtask)
                                                                              const user = {
                                                                                 id: results[0].userid
                                                                              }
                                                                              res.cookie("user", user);

                                                                           }
                                                                        })


                                                                     }
                                                                  })



                                                               }
                                                            })

                                                         }

                                                      })

                                                   }
                                                })



                                             }
                                          })


                                       }
                                    })

                                 }
                              })


                           }

                        })


                     }
                  });
               }

            }
         })

      }

   })
}
exports.eachstafftask = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM task WHERE taskid=?', [req.params.taskid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("UPDATE task SET ss=? WHERE taskid=? ", ["", req.params.taskid], function (err) {
                  if (err) throw err;
                  else {
                     res.render('eachstafftask', { title: 'User List', rows })

                  }
               })

            }
         })
      }
   })
}
exports.eachdeletedtaskhead = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * from deletedtask WHERE taskid=?", [req.params.taskid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * FROM groups,astawash WHERE groups.staffid=astawash.userid AND taskid=?", [req.params.taskid], function (err, groups) {
                  if (err) throw err;
                  else {
                     connection.query("UPDATE deletedtask SET head=?  WHERE taskid=?", ["", req.params.taskid], function (err) {
                        if (err) throw err;
                        else {
                           connection.query("SELECT * FROM deletedtask,astawash WHERE taskid=? AND deletedtask.staffid=astawash.userid ", [req.params.taskid], function (err, full) {
                              if (err) throw err;
                              else {
                                 console.log(groups);
                                 //console.log(rows);
                                 res.render("eachdeletedtask", { rows, groups })
                              }
                           })


                        }
                     })
                  }
               })


            }
         })
      }
   })

}
exports.showannouncement2 = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * FROM announce ORDER BY annid DESC', function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * FROM astawash WHERE userid=?", [req.params.userid], function (err, row) {
                  if (err) throw err;
                  else {
                     res.render('showannouncement2', { title: 'User List', rows, row })

                  }
               })

            }
         });

      }
   })
}
exports.eachannounce2 = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query('SELECT * from announce WHERE annid=?', [req.params.annid], function (err, rows) {
            if (err) throw err;
            else {
               res.render('eachannounce', { title: 'User List', rows })



            }
         })
      }
   })
}
exports.eachdchtasks = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * FROM task WHERE taskid=?", [req.params.taskid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("UPDATE deadlinechanges SET sh=? WHERE rollno=?", ["", req.params.rollno], function (err) {
                  if (err) throw err;
                  else {
                     res.render('eachtask', { rows });


                  }
               })
            }
         })
      }
   })
}
exports.eachschtask = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * from task WHERE taskid=?", [req.params.taskid], function (err, rows) {
            if (err) throw err;
            else {
               connection.query("UPDATE deadlinechanges SET ssh=? WHERE rollno=?", ["", req.params.rollno], function (err) {
                  if (err) throw err;
                  else {
                     res.render("eachtask", { rows });


                  }
               })
            }
         })
      }
   });

}
exports.notifyrequest2 = function (req, res) {
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
      else {
         connection.query("SELECT * FROM requestreport", function (err, rows) {
            if (err) throw err;
            else {
               connection.query("SELECT * FROM astawash WHERE jobposition=?", ["school head"], function (err, roww) {
                  if (err) throw err;
                  else {
                     res.render("notifyrequest2", { rows, roww })


                  }
               })
            }
         })
      }
   })

}
exports.changeotherform=function(req,res){
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
   else{
      connection.query("SELECT * from astawash WHERE USERID=?",[req.params.userid],function(err,row){
         if(err) throw err;
         else{
            res.render("changeother",{row});



         }
      })
   }})

}
exports.changeother=function(req,res){
const {newname,newemail}=req.body;
   pool.getConnection(function (error, connection) {
      if (error) {
         console.log(' not successful');
      }
   else{
      connection.query("UPDATE astawash SET fullname=?,email=?",[newname,newemail],function(err){
         if(err) throw err;
         else{
            connection.query("SELECT * from astawash WHERE USERID=?",[req.params.userid],function(err,row){
            if(err) throw err;
            else{
               res.render("changeother",{success:"success",row});


            }
            })

         }
      })

   }})

};