var sqlite3 = require("sqlite3").verbose();

var _getGrades = function(db,onComplete){
	var q = 'select * from grades';
	db.all(q,onComplete);
};

var _getStudentsByGrade = function(db,onComplete){
	_getGrades(db,function(err,grades){		
		db.all('select * from students', function(err1,students){
			grades.forEach(function(g){
				g.students = students.filter(function(s){return s.grade_id==g.id});
			})			
			onComplete(null,grades);
		})
	});	
};

var _getSubjectsByGrade = function(db,onComplete){
	_getGrades(db,function(err,grades){		
		db.all('select * from subjects', function(err1,subjects){
			
			grades.forEach(function(g){
				g.subjects = subjects.filter(function(s){return s.grade_id==g.id});
			})			
			onComplete(null,grades);
		})
	});	
};
var _getStudentSummary = function(id, db,onComplete){
	var student_grade_query = 'select s.name as name, s.id as id, g.name as grade_name, g.id as grade_id '+
		'from students s, grades g where s.grade_id = g.id and s.id='+id;
	var subject_score_query = 'select su.name, su.id, su.maxScore, sc.score '+
		'from subjects su, scores sc '+
		'where su.id = sc.subject_id and sc.student_id ='+id;
	var allGrades;
	db.all('select * from grades',function(err,rows){
				allGrades = rows;
	});
	db.get(student_grade_query,function(est,student){
		if(!student){
			onComplete(null,null);
			return;
		}
		db.all(subject_score_query,function(esc,subjects){			
			student.subjects = subjects;
			student.allGrades = allGrades;
			onComplete(null,student);
		})
	});
};

var _getSubjectSummary = function(db,onComplete){
	var subjectSummaryQuery = "select sub.id,sub.name,sub.maxScore,grade.name"+
	" as grade from subjects sub inner join grades grade on grade.id == sub.grade_id";
	db.all(subjectSummaryQuery,onComplete);
}

var _updateGrade = function(data,db,onComplete){
		var updateQuery = "update grades set name='"+data.new_grade+"' where id ="+data.prev_grade;
		db.run(updateQuery,function(err){
			if(!err)
				onComplete(null,true);
		});
};

var _updateStudentSummary = function(data,db,onComplete){
	var studentUpdateQuery = "update students set name='"+data.new_name+
						"',grade_id="+data.new_grade+" where id="+data.id;
	var scoreUpdateQuery = "update scores set score="+data.new_score+
						" where student_id="+data.id+" and subject_id="+data.subject;
	db.run(studentUpdateQuery,function(err){
		if(!err)
			db.run(scoreUpdateQuery,onComplete(null,true));	
	});				
};

var _updateSubjectSummary = function(data,db,onComplete){		
	var subjectUpdateQuery = "update subjects set name='"+data.new_name+"',maxScore="+
					data.new_score+",grade_id="+data.new_grade+" where id="+data.subject_id;
	var deleteScoreQuery = "delete from scores where subject_id="+data.subject_id;
	db.run(subjectUpdateQuery,function(err){
		if(!err){
			db.run(deleteScoreQuery,function(err){
				onComplete(null,true);
			})
		}
				
	});	
};

var _addStudent = function(data,db,onComplete){
	var addStudentQuery = "insert into students (name,grade_id) values('"+
						data.stu_name+"',"+data.grade+")";
	db.run(addStudentQuery,function(err){
		if(!err)
			onComplete(null,true);	
	});	

};

var _addSubject = function(data,db,onComplete){
	var addSubjectQuery = "insert into subjects (name,maxScore,grade_id) values('"+
					data.sub_name+"',"+data.maxScore+","+data.grade+")";
	db.run(addSubjectQuery,function(err){
		if(!err)
			onComplete(null,true);	
	});	
};

var _subjectSummaryBySubjectName = function(id,db,onComplete){
	var getScoreQuery = "select stu.id,stu.name,sco.score,stu.grade_id from students stu inner join scores sco on stu.id = sco.student_id and sco.subject_id="+id;
	var getGrade = "select name as grade from  grades where id=";
	var subject;
	db.all("select id as sub_id,name as subject from subjects where id="+id,function(err,sub_name){
		subject = sub_name;
	})
	db.all(getScoreQuery,function(err,scoreData){
		if(!err){
			db.all(getGrade+scoreData[0].grade_id,function(err2,gradeData){
				gradeData.push(scoreData);
				gradeData.unshift(subject[0]);
				onComplete(null,gradeData);
			})
		}

	});
};

var _addScore = function(data,db,onComplete){
	var addScoreQuery = "insert into scores(student_id,subject_id,score) values($student_id,$subject_id,$score)";
	var param = {$student_id:data.student,$subject_id:data.subject,$score:data.score};
	db.run(addScoreQuery,param,function(err){
		if(!err)
			onComplete(null,true);
	});
};

var _classSummary = function(grade_id,db,onComplete){
	var classSummaryQuery = "select stu.id as stu_id,stu.name as stu_name,stu.grade_id,"+
							"grade.name as grade from students stu inner join grades grade on"+
							" stu.grade_id=grade.id where stu.grade_id="+grade_id;
	var getSubjectsQuery = "select id as sub_id,name as subject,maxScore from subjects"+
							" where grade_id="+grade_id;
	var result = [];
	db.all(classSummaryQuery,function(err,classData){
		if(!err)
			db.all(getSubjectsQuery,function(err,subjects){
				result.push(subjects);
				result.push(classData);
				onComplete(null,result);
			});
	});
};

var init = function(location){
	var operate = function(operation){
		return function(){
			var onComplete = (arguments.length == 2)?arguments[1]:arguments[0];
			var arg = (arguments.length == 2) && arguments[0];
			var onDBOpen = function(err){
				if(err){onComplete(err);return;}
				db.run("PRAGMA foreign_keys = 'ON';");
				arg && operation(arg,db,onComplete);
				arg || operation(db,onComplete);
				db.close();
			};
			var db = new sqlite3.Database(location,onDBOpen);
		};	
	};

	var records = {		
		getGrades: operate(_getGrades),
		getStudentsByGrade: operate(_getStudentsByGrade),
		getSubjectsByGrade: operate(_getSubjectsByGrade),
		getStudentSummary: operate(_getStudentSummary),
		getSubjectSummary: operate(_getSubjectSummary),
		update_Grade:operate(_updateGrade),
		updateStudentSummary:operate(_updateStudentSummary),
		updateSubjectSummary:operate(_updateSubjectSummary),
		addStudent:operate(_addStudent),
		addSubject:operate(_addSubject),
		subjectSummaryBySubjectName:operate(_subjectSummaryBySubjectName),
		addScore:operate(_addScore),
		classSummary:operate(_classSummary)
	};

	return records;
};

exports.init = init;
////////////////////////////////////
exports.getSubjects = function(grade,callback){
	var subjects = grade == 'one' && [
		{name:'english-1',grade:'one',max:125},
		{name:'moral science',grade:'one',max:50},
		{name:'general science',grade:'one',max:100},
		{name:'maths-1',grade:'one',max:100},
		{name:'craft',grade:'one',max:25},
		{name:'music',grade:'one',max:25},
		{name:'hindi-1',grade:'one',max:75}
	] || [];
	callback(null,subjects);
};

exports.getScoresBySubject = function(subject,callback){
	var scores = subject != 'craft' && [] || [
		{name:'Abu',score:20},
		{name:'Babu',score:18},
		{name:'Ababu',score:21},
		{name:'Dababu',score:22},
		{name:'Badadadababu',score:23},
		{name:'babudada',score:24}
	];
	callback(null,scores);
};